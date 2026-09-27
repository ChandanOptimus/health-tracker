import {
  MealOption,
  MealPlanSection,
  MealSection,
  NutritionPlan,
} from "@/types/nutrition";

export type DietSheet = Array<
  Array<string | number | null | undefined>
>;

type RawLine = string;

const MEAL_HEADERS: Record<
  string,
  {
    type: MealSection;
    title: string;
  }
> = {
  breakfast: {
    type: "breakfast",
    title: "Breakfast",
  },

  "breakfast or meal 1": {
    type: "breakfast",
    title: "Breakfast",
  },

  lunch: {
    type: "lunch",
    title: "Lunch",
  },

  "lunch or meal 2": {
    type: "lunch",
    title: "Lunch",
  },

  snacks: {
    type: "snacks",
    title: "Snacks",
  },

  dinner: {
    type: "dinner",
    title: "Dinner",
  },

  "dinner or meal 3": {
    type: "dinner",
    title: "Dinner",
  },
};

export function parseDietSheet(
  rows: DietSheet,
): NutritionPlan {
  const lines = rows
    .map((row) => row?.[0])
    .filter(
      (
        value,
      ): value is string | number =>
        typeof value === "string" ||
        typeof value === "number",
    )
    .map(String)
    .map(cleanLine)
    .filter(Boolean);

  const calorieTarget =
    parseCalories(lines);

  const meals: MealPlanSection[] = [];

  const sections =
    findMealSections(lines);

  for (const section of sections) {
    const mealLines = lines.slice(
      section.start,
      section.end,
    );

    meals.push(
      parseMealSection(
        section.type,
        section.title,
        mealLines,
      ),
    );
  }

  const guidelines =
    extractSection(
      lines,
      "General Diet Guidelines;",
      ["Supplements:"],
    );

  const supplements =
    extractSection(
      lines,
      "Supplements:",
      [],
    );

  return {
    calorieTarget,
    meals,
    guidelines,
    supplements,
  };
}

function findMealSections(
  lines: RawLine[],
) {
  const matches: Array<{
    type: MealSection;
    title: string;
    start: number;
    end: number;
  }> = [];

  for (
    let index = 0;
    index < lines.length;
    index++
  ) {
    const normalized =
      normalizeHeader(lines[index]);

    const header =
      MEAL_HEADERS[normalized];

    if (!header) {
      continue;
    }

    const previous =
      matches[matches.length - 1];

    if (previous) {
      previous.end = index;
    }

    matches.push({
      type: header.type,
      title: header.title,
      start: index + 1,
      end: lines.length,
    });
  }

  return matches;
}

/**
 * Parses one complete meal section.
 *
 * Example:
 *
 * Breakfast
 *
 * Option 1
 *   food
 *   food
 *
 * OR
 *
 * Option 2
 *   food
 *   food
 *
 * OR
 *
 * Option 3
 *   food
 *   food
 *
 * P-35 C-45 F-5
 *
 * The P/C/F values occur once at the
 * bottom of the section but apply to
 * every option in that meal.
 */
function parseMealSection(
  type: MealSection,
  title: string,
  lines: RawLine[],
): MealPlanSection {
  const options: MealOption[] = [];

  let currentItems: string[] = [];

  let sectionMacros:
    | MealOption["macros"]
    | undefined;

  let optionNumber = 1;

  function saveCurrentOption() {
    if (currentItems.length === 0) {
      return;
    }

    options.push({
      id: `${type}-${optionNumber}`,

      items: currentItems,

      // The meal's macro target is
      // intentionally applied to every
      // option.
      macros: sectionMacros,
    });

    optionNumber++;

    currentItems = [];
  }

  for (const line of lines) {
    /*
     * The macro line belongs to the
     * WHOLE MEAL SECTION.
     *
     * Don't save the current option here.
     * Just remember the macros.
     */
    if (isMacroLine(line)) {
      sectionMacros =
        parseMacros(line);

      continue;
    }

    /*
     * A standalone OR separates
     * meal options.
     *
     * Important:
     * "OR" inside a food description is
     * NOT treated as a separator because
     * this check requires the entire
     * line to be OR.
     */
    if (isStandaloneOr(line)) {
      saveCurrentOption();
      continue;
    }

    /*
     * Ignore explanatory metadata.
     */
    if (
      isNutritionMetadata(line)
    ) {
      continue;
    }

    currentItems.push(
      cleanMealItem(line),
    );
  }

  /*
   * Save the final option.
   */
  saveCurrentOption();

  /*
   * In the workbook the macro line comes
   * after the final option.
   *
   * We therefore apply the discovered
   * section macros to every option again
   * here to make the relationship explicit.
   */
  for (const option of options) {
    option.macros = sectionMacros;
  }

  return {
    type,
    title,
    options,
  };
}

function parseCalories(
  lines: RawLine[],
): number | null {
  const line = lines.find((item) =>
    /^Calories\s*-/i.test(item),
  );

  if (!line) {
    return null;
  }

  const match =
    line.match(
      /Calories\s*-\s*([\d,]+)/i,
    );

  if (!match) {
    return null;
  }

  const calories = Number(
    match[1].replace(/,/g, ""),
  );

  return Number.isFinite(calories)
    ? calories
    : null;
}

function parseMacros(
  line: string,
): {
  protein?: number;
  carbs?: number;
  fats?: number;
} {
  const protein =
    line.match(
      /P\s*-\s*([\d.]+)/i,
    );

  const carbs =
    line.match(
      /C\s*-\s*([\d.]+)/i,
    );

  const fats =
    line.match(
      /F\s*-\s*([\d.]+)/i,
    );

  return {
    protein: protein
      ? Number(protein[1])
      : undefined,

    carbs: carbs
      ? Number(carbs[1])
      : undefined,

    fats: fats
      ? Number(fats[1])
      : undefined,
  };
}

/**
 * Extracts a section such as
 * General Diet Guidelines or Supplements.
 */
function extractSection(
  lines: RawLine[],
  startMarker: string,
  endMarkers: string[],
): string[] {
  const startIndex =
    lines.findIndex(
      (line) =>
        normalizeHeader(line) ===
        normalizeHeader(startMarker),
    );

  if (startIndex === -1) {
    return [];
  }

  let endIndex = lines.length;

  for (
    let index = startIndex + 1;
    index < lines.length;
    index++
  ) {
    if (
      endMarkers.some(
        (marker) =>
          normalizeHeader(
            lines[index],
          ) ===
          normalizeHeader(marker),
      )
    ) {
      endIndex = index;
      break;
    }
  }

  return lines
    .slice(startIndex + 1, endIndex)
    .filter(
      (line) =>
        !isNutritionMetadata(line),
    );
}

function cleanLine(
  value: string,
): string {
  return value
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanMealItem(
  value: string,
): string {
  return value
    .replace(/^•\s*/, "")
    .trim();
}

function normalizeHeader(
  value: string,
): string {
  return value
    .replace(/[🔥]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Only a line containing exactly "OR"
 * separates meal options.
 *
 * This is important because many of the
 * actual food lines contain "OR" as part
 * of their alternatives.
 */
function isStandaloneOr(
  value: string,
): boolean {
  return /^or$/i.test(
    value.trim(),
  );
}

function isMacroLine(
  value: string,
): boolean {
  return /^P\s*-\s*[\d.]+.*C\s*-\s*[\d.]+.*F\s*-\s*[\d.]+/i.test(
    value,
  );
}

function isNutritionMetadata(
  value: string,
): boolean {
  return (
    /^P-Protein/i.test(value) ||
    /^Calories\s*-/i.test(value) ||
    /^General Diet Guidelines/i.test(
      value,
    ) ||
    /^Supplements:/i.test(value)
  );
}