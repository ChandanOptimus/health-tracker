import {
  WorkoutDay,
  WorkoutExercise,
  WorkoutPlan,
} from "@/types/workout";

export type WorkoutSheet = Array<
  Array<string | number | Date | null | undefined>
>;

const TOTAL_DAYS = 7;

export function parseWorkoutSheet(
  rows: WorkoutSheet,
): WorkoutPlan {
  const warmup = parseWarmup(rows);
  const stretching = parseStretching(rows);
  const dailyTasks = parseDailyTasks(rows);

  const days: WorkoutDay[] = [];

  for (let day = 1; day <= TOTAL_DAYS; day++) {
    const startIndex = findDayStart(
      rows,
      day,
    );

    if (startIndex === -1) {
      continue;
    }

    const endIndex = findNextDayStart(
      rows,
      startIndex,
    );

    const dayRows = rows.slice(
      startIndex + 1,
      endIndex === -1
        ? rows.length
        : endIndex,
    );

    const isRestDay =
      dayRows.some((row) =>
        String(row?.[0] ?? "")
          .trim()
          .toUpperCase()
          .includes("REST DAY"),
      );

    days.push({
      day,
      title: isRestDay
        ? "Rest Day"
        : `Day ${day}`,
      exercises: isRestDay
        ? []
        : parseExercises(dayRows),
      warmup: day === 1
        ? warmup
        : [],
      stretching: day === 7
        ? stretching
        : [],
      dailyTasks: day === 1
        ? dailyTasks
        : [],
      isRestDay,
    });
  }

  return {
    days,
  };
}

function parseExercises(
  rows: WorkoutSheet,
): WorkoutExercise[] {
  const exercises: WorkoutExercise[] = [];

  for (
    let index = 0;
    index < rows.length;
    index++
  ) {
    const row = rows[index];

    const rawName = row?.[0];

    if (
      rawName === null ||
      rawName === undefined ||
      String(rawName).trim() === ""
    ) {
      continue;
    }

    const nameValue =
      String(rawName).trim();

    if (
      isSectionHeading(nameValue) ||
      isInstructionLine(nameValue) ||
      isUrl(nameValue)
    ) {
      continue;
    }

    /*
     * The workbook uses formulas such as:
     *
     * =HYPERLINK("https://youtu.be/...",
     * "Lat pulldown...")
     *
     * When the Google Sheets API returns
     * FORMATTED_VALUE, we normally receive
     * the displayed text, but this parser
     * also supports the formula form.
     */
    const parsed =
      parseExerciseName(nameValue);

    const sets = parseSets(row?.[1]);

    const reps = parseReps(row?.[2]);

    if (
      !parsed.name &&
      sets === null &&
      reps === null
    ) {
      continue;
    }

    exercises.push({
      id: `exercise-${exercises.length + 1}`,

      name:
        parsed.name ||
        nameValue,

      sets,

      reps,

      notes: [],

      youtubeUrl:
        parsed.youtubeUrl,
    });
  }

  return exercises;
}

function parseExerciseName(
  value: string,
): {
  name: string;
  youtubeUrl: string | null;
} {
  const formulaMatch =
    value.match(
      /^=HYPERLINK\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\)$/i,
    );

  if (formulaMatch) {
    return {
      youtubeUrl:
        formulaMatch[1],
      name:
        formulaMatch[2].trim(),
    };
  }

  /*
   * Some Google Sheets responses may
   * return the displayed name and lose
   * the hyperlink formula.
   */
  return {
    name: value,
    youtubeUrl: null,
  };
}

function parseSets(
  value:
    | string
    | number
    | Date
    | null
    | undefined,
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value)
      ? String(value)
      : null;
  }

  const text =
    String(value).trim();

  return text || null;
}

function parseReps(
  value:
    | string
    | number
    | Date
    | null
    | undefined,
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  /*
   * A few cells in the workbook are
   * formatted as dates even though they
   * represent values such as 10-15.
   *
   * Handle normal strings/numbers first.
   */
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    const text =
      String(value).trim();

    return text || null;
  }

  return null;
}

function findDayStart(
  rows: WorkoutSheet,
  day: number,
): number {
  const target =
    `DAY ${day}`;

  return rows.findIndex(
    (row) =>
      String(row?.[0] ?? "")
        .trim()
        .toUpperCase() === target,
  );
}

function findNextDayStart(
  rows: WorkoutSheet,
  currentIndex: number,
): number {
  for (
    let index = currentIndex + 1;
    index < rows.length;
    index++
  ) {
    const value =
      String(
        rows[index]?.[0] ?? "",
      )
        .trim()
        .toUpperCase();

    if (/^DAY [1-7]$/.test(value)) {
      return index;
    }
  }

  return -1;
}

function parseWarmup(
  rows: WorkoutSheet,
): string[] {
  const result: string[] = [];

  const startIndex =
    rows.findIndex(
      (row) =>
        String(row?.[0] ?? "")
          .trim()
          .toUpperCase() ===
        "WARM-UP GUIDELINES:",
    );

  if (startIndex === -1) {
    return result;
  }

  const endIndex =
    rows.findIndex(
      (row, index) =>
        index > startIndex &&
        String(row?.[0] ?? "")
          .trim()
          .toUpperCase() ===
          "DAY 1",
    );

  const end =
    endIndex === -1
      ? rows.length
      : endIndex;

  for (
    let index = startIndex + 1;
    index < end;
    index++
  ) {
    const value =
      String(
        rows[index]?.[0] ?? "",
      ).trim();

    if (!value) {
      continue;
    }

    if (isUrl(value)) {
      continue;
    }

    if (
      value
        .toUpperCase()
        .startsWith(
          "DYNAMIC WARM-UP",
        )
    ) {
      continue;
    }

    if (
      value
        .toUpperCase()
        .startsWith(
          "• YOU CAN CLICK",
        )
    ) {
      continue;
    }

    result.push(
      cleanBullet(value),
    );
  }

  return result;
}

function parseStretching(
  rows: WorkoutSheet,
): string[] {
  const result: string[] = [];

  const startIndex =
    rows.findIndex(
      (row) =>
        String(row?.[0] ?? "")
          .trim()
          .toUpperCase()
          .startsWith("STRETCHING"),
    );

  if (startIndex === -1) {
    return result;
  }

  for (
    let index = startIndex + 1;
    index < rows.length;
    index++
  ) {
    const value =
      String(
        rows[index]?.[0] ?? "",
      ).trim();

    if (!value) {
      continue;
    }

    if (isUrl(value)) {
      result.push(value);
      break;
    }

    if (
      value
        .toUpperCase()
        .startsWith(
          "EXERCISE LIBRARY",
        )
    ) {
      break;
    }
  }

  return result;
}

function parseDailyTasks(
  rows: WorkoutSheet,
): string[] {
  const result: string[] = [];

  const startIndex =
    rows.findIndex(
      (row) =>
        String(row?.[0] ?? "")
          .trim()
          .toUpperCase()
          .startsWith(
            "IMPORTANT TASKS FOR YOU",
          ),
    );

  if (startIndex === -1) {
    return result;
  }

  for (
    let index = startIndex + 1;
    index < rows.length;
    index++
  ) {
    const value =
      String(
        rows[index]?.[0] ?? "",
      ).trim();

    if (!value) {
      continue;
    }

    if (
      value
        .toUpperCase()
        .startsWith("DATED:")
    ) {
      break;
    }

    result.push(
      cleanBullet(value),
    );
  }

  return result;
}

function cleanBullet(
  value: string,
): string {
  return value
    .replace(/^•\s*/, "")
    .trim();
}

function isUrl(
  value: string,
): boolean {
  return /^https?:\/\//i.test(
    value.trim(),
  );
}

function isSectionHeading(
  value: string,
): boolean {
  const upper =
    value.toUpperCase();

  return (
    upper === "REST DAY" ||
    upper.startsWith(
      "HAVE AWESOME WORKOUTS",
    ) ||
    upper.startsWith(
      "STRETCHING",
    ) ||
    upper.startsWith(
      "EXERCISE LIBRARY",
    ) ||
    upper.startsWith(
      "IMPORTANT TASKS",
    ) ||
    upper.startsWith("DATED:")
  );
}

function isInstructionLine(
  value: string,
): boolean {
  const upper =
    value.toUpperCase();

  return (
    upper.startsWith("•") ||
    upper.startsWith(
      "WARM-UP GUIDELINES",
    ) ||
    upper.startsWith(
      "DYNAMIC WARM-UP",
    )
  );
}