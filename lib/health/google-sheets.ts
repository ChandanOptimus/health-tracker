import { google } from "googleapis";
import { CheckInSheet } from "./sheets";
import { DietSheet } from "./diet";
import { WorkoutSheet } from "./workout";
import { HealthProfile } from "@/types/profile";

const CHECK_IN_RANGE = "'Check-in'!A1:AW39";
const DIET_RANGE = "'Diet'!A1:A147";
const WORKOUT_RANGE = "'WORKOUT'!A1:C89";

const WORKOUT_SCHEDULE_RANGE = "'Workout Schedule'!A1:B8";
const WORKOUT_LOGS_RANGE = "'Workout Logs'!A1:I1000";
const PROFILE_RANGE = "'Profile'!A1:B4";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function getGoogleCredentials() {
  const clientEmail = getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");

  const privateKey = getRequiredEnv("GOOGLE_PRIVATE_KEY").replace(
    /\\n/g,
    "\n"
  );

  return {
    client_email: clientEmail,
    private_key: privateKey,
  };
}

function getSheetsClient() {
  const credentials = getGoogleCredentials();

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({
    version: "v4",
    auth,
  });
}

export async function getCheckInSheet(): Promise<CheckInSheet> {
  const spreadsheetId = getRequiredEnv("GOOGLE_SHEET_ID");
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: CHECK_IN_RANGE,
    valueRenderOption: "UNFORMATTED_VALUE",
  });

  return (response.data.values ?? []) as CheckInSheet;
}

export async function getDietSheet(): Promise<DietSheet> {
  const spreadsheetId = getRequiredEnv("GOOGLE_SHEET_ID");
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: DIET_RANGE,
    valueRenderOption: "FORMATTED_VALUE",
  });

  return (response.data.values ?? []) as DietSheet;
}

export async function getWorkoutSheet(): Promise<WorkoutSheet> {
  const spreadsheetId = getRequiredEnv("GOOGLE_SHEET_ID");
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: WORKOUT_RANGE,
    valueRenderOption: "FORMATTED_VALUE",
  });

  return (response.data.values ?? []) as WorkoutSheet;
}

export async function getWorkoutScheduleSheet() {
  const spreadsheetId = getRequiredEnv("GOOGLE_SHEET_ID");
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: WORKOUT_SCHEDULE_RANGE,
    valueRenderOption: "FORMATTED_VALUE",
  });

  return response.data.values ?? [];
}

export async function updateWorkoutScheduleSheet(
  values: string[][]
): Promise<void> {
  const spreadsheetId = getRequiredEnv("GOOGLE_SHEET_ID");
  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: WORKOUT_SCHEDULE_RANGE,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values,
    },
  });
}

export async function getWorkoutLogsSheet() {
  const spreadsheetId = getRequiredEnv("GOOGLE_SHEET_ID");
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: WORKOUT_LOGS_RANGE,
    valueRenderOption: "FORMATTED_VALUE",
  });

  return response.data.values ?? [];
}

export async function appendWorkoutLogsSheet(
  values: string[][]
): Promise<void> {
  const spreadsheetId = getRequiredEnv("GOOGLE_SHEET_ID");
  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "'Workout Logs'!A:I",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values,
    },
  });
}

export async function clearWorkoutLogRows(
  startRow: number,
  endRow: number
): Promise<void> {
  if (startRow > endRow) {
    return;
  }

  const spreadsheetId = getRequiredEnv("GOOGLE_SHEET_ID");
  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `'Workout Logs'!A${startRow}:I${endRow}`,
    requestBody: {},
  });
}

export async function getHealthProfile(): Promise<HealthProfile> {
  const spreadsheetId = getRequiredEnv("GOOGLE_SHEET_ID");
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: PROFILE_RANGE,
    valueRenderOption: "UNFORMATTED_VALUE",
  });

  const rows = response.data.values ?? [];

  let heightCm: number | null = null;
  let currentWeightKg: number | null = null;
  let goalWeightKg: number | null = null;

  for (const row of rows) {
    const setting = String(row[0] ?? "")
      .trim()
      .toLowerCase();

    const rawValue = row[1];

    if (
      rawValue === undefined ||
      rawValue === null ||
      rawValue === ""
    ) {
      continue;
    }

    const value = Number(rawValue);

    if (!Number.isFinite(value)) {
      continue;
    }

    switch (setting) {
      case "height (cm)":
        heightCm = value;
        break;

      case "current weight (kg)":
        currentWeightKg = value;
        break;

      case "goal weight (kg)":
        goalWeightKg = value;
        break;
    }
  }

  if (heightCm === null) {
    throw new Error(
      "Profile sheet is missing a valid Height (cm) value."
    );
  }

  if (currentWeightKg === null) {
    throw new Error(
      "Profile sheet is missing a valid Current Weight (kg) value."
    );
  }

  if (goalWeightKg === null) {
    throw new Error(
      "Profile sheet is missing a valid Goal Weight (kg) value."
    );
  }

  return {
    heightCm,
    currentWeightKg,
    goalWeightKg,
  };
}
export async function updateCheckInWeight(
  week: number,
  day: number,
  weightKg: number
): Promise<void> {
  if (!Number.isInteger(week) || week < 1 || week > 48) {
    throw new Error("Week must be between 1 and 48.");
  }

  if (!Number.isInteger(day) || day < 1 || day > 7) {
    throw new Error("Day must be between 1 and 7.");
  }

  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    throw new Error("Weight must be a valid positive number.");
  }

  const spreadsheetId = getRequiredEnv("GOOGLE_SHEET_ID");
  const sheets = getSheetsClient();

  /*
   * Check-in structure:
   *
   * Column A = labels
   * Column B = Week 1
   * Column C = Week 2
   * ...
   * Column AW = Week 48
   *
   * Day 1 = row 2
   * Day 2 = row 3
   * ...
   * Day 7 = row 8
   */
  const columnNumber = week + 1;
  const rowNumber = day + 1;

  const columnLetter = getColumnLetter(columnNumber);
  const range = `'Check-in'!${columnLetter}${rowNumber}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[weightKg]],
    },
  });
}

function getColumnLetter(columnNumber: number): string {
  let result = "";
  let number = columnNumber;

  while (number > 0) {
    const remainder = (number - 1) % 26;

    result =
      String.fromCharCode(65 + remainder) + result;

    number = Math.floor((number - 1) / 26);
  }

  return result;
}
export async function updateCheckInMeasurements(
  week: number,
  measurements: {
    rightBicepsIn: number;
    leftBicepsIn: number;
    chestIn: number;
    rightThighIn: number;
    leftThighIn: number;
    waistIn: number;
  }
): Promise<void> {
  if (!Number.isInteger(week) || week < 1 || week > 48) {
    throw new Error("Week must be between 1 and 48.");
  }

  const values = [
    [
      measurements.rightBicepsIn,
      measurements.leftBicepsIn,
      measurements.chestIn,
      measurements.rightThighIn,
      measurements.leftThighIn,
      measurements.waistIn,
    ],
  ];

  if (values[0].some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new Error("All measurements must be valid positive numbers.");
  }

  const spreadsheetId = getRequiredEnv("GOOGLE_SHEET_ID");
  const sheets = getSheetsClient();

  /*
   * Check-in sheet:
   *
   * Row 23 = Right Biceps
   * Row 24 = Left Biceps
   * Row 25 = Chest
   * Row 26 = Right Thigh
   * Row 27 = Left Thigh
   * Row 28 = Waist
   *
   * Week 1 = B
   * Week 2 = C
   * ...
   * Week 48 = AW
   */

  const columnNumber = week + 1;
  const columnLetter = getColumnLetter(columnNumber);

  const range = `'Check-in'!${columnLetter}23:${columnLetter}28`;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: values[0].map((value) => [value]),
    },
  });
}