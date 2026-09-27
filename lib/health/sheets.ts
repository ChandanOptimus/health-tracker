import {
  Adherence,
  Measurements,
  WeightEntry,
  WellnessScores,
} from "@/types/health";

export type SheetCell = string | number | null | undefined;

export type CheckInSheet = SheetCell[][];

const TOTAL_WEEKS = 48;
const DAYS_PER_WEEK = 7;

/**
 * Google Sheets / Excel layout:
 *
 *        A             B        C        D
 *        -----------------------------------
 * 1      PROGRESS      Week 1   Week 2   Week 3
 * 2      Day 1         weight   weight   weight
 * 3      Day 2         weight   weight   weight
 * ...
 * 8      Day 7         weight   weight   weight
 *
 * Therefore:
 * - Week 1 = column B = index 1
 * - Week 2 = column C = index 2
 * - ...
 * - Week 48 = column AW = index 48
 */

/**
 * Parse the 7 daily weight rows into normalized entries.
 */
export function parseWeightEntries(
  rows: CheckInSheet,
): WeightEntry[] {
  const entries: WeightEntry[] = [];

  for (let week = 1; week <= TOTAL_WEEKS; week++) {
    const columnIndex = week;

    for (let day = 1; day <= DAYS_PER_WEEK; day++) {
      const rowIndex = day;

      const rawValue =
        rows[rowIndex]?.[columnIndex];

      entries.push({
        week,
        day,
        weightKg: parseNumber(rawValue),
      });
    }
  }

  return entries;
}

/**
 * Parse body measurements.
 *
 * Workbook:
 *
 * Row 23 = Right biceps
 * Row 24 = Left biceps
 * Row 25 = Chest
 * Row 26 = Right thigh
 * Row 27 = Left thigh
 * Row 28 = Waist
 *
 * Column B = start / Week 1
 * Column C = Week 2
 * ...
 * Column AW = Week 48
 */
export function parseMeasurements(
  rows: CheckInSheet,
): Record<number, Measurements> {
  const result: Record<number, Measurements> = {};

  for (let week = 1; week <= TOTAL_WEEKS; week++) {
    const columnIndex = week;

    result[week] = {
      rightBicepsIn: parseNumber(
        rows[22]?.[columnIndex],
      ),

      leftBicepsIn: parseNumber(
        rows[23]?.[columnIndex],
      ),

      chestIn: parseNumber(
        rows[24]?.[columnIndex],
      ),

      rightThighIn: parseNumber(
        rows[25]?.[columnIndex],
      ),

      leftThighIn: parseNumber(
        rows[26]?.[columnIndex],
      ),

      waistIn: parseNumber(
        rows[27]?.[columnIndex],
      ),
    };
  }

  return result;
}

/**
 * Parse weekly wellness scores.
 *
 * Row 32 = Sleep issues
 * Row 33 = Hunger issues
 * Row 34 = Stress issues
 *
 * Scale:
 * 0 = good
 * 5 = very bad
 */
export function parseWellness(
  rows: CheckInSheet,
): Record<number, WellnessScores> {
  const result: Record<
    number,
    WellnessScores
  > = {};

  for (let week = 1; week <= TOTAL_WEEKS; week++) {
    const columnIndex = week;

    result[week] = {
      sleepIssues: parseNumber(
        rows[31]?.[columnIndex],
      ),

      hungerIssues: parseNumber(
        rows[32]?.[columnIndex],
      ),

      stressIssues: parseNumber(
        rows[33]?.[columnIndex],
      ),
    };
  }

  return result;
}

/**
 * Parse diet and workout adherence.
 *
 * Row 38 = Diet adherence
 * Row 39 = Workout adherence
 *
 * Scale:
 * 0 = not followed
 * 10 = fully followed
 */
export function parseAdherence(
  rows: CheckInSheet,
): Record<number, Adherence> {
  const result: Record<
    number,
    Adherence
  > = {};

  for (let week = 1; week <= TOTAL_WEEKS; week++) {
    const columnIndex = week;

    result[week] = {
      diet: parseNumber(
        rows[37]?.[columnIndex],
      ),

      workout: parseNumber(
        rows[38]?.[columnIndex],
      ),
    };
  }

  return result;
}

/**
 * Safely convert a spreadsheet value into a number.
 *
 * Empty cells and spreadsheet errors are treated as null.
 */
export function parseNumber(
  value: SheetCell,
): number | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : null;
  }

  const text = String(value).trim();

  if (!text) {
    return null;
  }

  // Ignore spreadsheet error values such as:
  // #DIV/0!, #VALUE!, #N/A, etc.
  if (text.startsWith("#")) {
    return null;
  }

  const parsed = Number(text);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}