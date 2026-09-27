import {
  appendWorkoutLogsSheet,
  clearWorkoutLogRows,
  getWorkoutLogsSheet,
} from "@/lib/health/google-sheets";
import { ExerciseLog, WorkoutLog } from "@/types/workout-log";

function parseBoolean(value: unknown): boolean {
  return String(value).toLowerCase() === "true";
}

function parseNullableNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function parseExerciseLog(row: string[]): ExerciseLog {
  return {
    exerciseId: String(row[3] ?? ""),
    completed: parseBoolean(row[4]),
    actualSets: parseNullableNumber(row[5]),
    actualReps: row[6] ? String(row[6]) : null,
    notes: String(row[7] ?? ""),
  };
}

function parseWorkoutLogs(rows: string[][]): WorkoutLog[] {
  if (rows.length <= 1) {
    return [];
  }

  const grouped = new Map<string, WorkoutLog>();

  for (const row of rows.slice(1)) {
    const date = String(row[0] ?? "").trim();

    if (!date) {
      continue;
    }

    const workoutDay = Number(row[1]);

    if (!Number.isInteger(workoutDay)) {
      continue;
    }

    const id = `${date}-day-${workoutDay}`;

    let workoutLog = grouped.get(id);

    if (!workoutLog) {
      workoutLog = {
        id,
        date,
        workoutDay,
        completed: parseBoolean(row[2]),
        exercises: [],
        notes: String(row[8] ?? ""),
      };

      grouped.set(id, workoutLog);
    }

    const exerciseId = String(row[3] ?? "").trim();

    if (exerciseId) {
      workoutLog.exercises.push(parseExerciseLog(row));
    }
  }

  return Array.from(grouped.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

export async function getWorkoutLogs(): Promise<WorkoutLog[]> {
  const rows = await getWorkoutLogsSheet();

  return parseWorkoutLogs(rows);
}

export async function getWorkoutLogByDate(
  date: string
): Promise<WorkoutLog | null> {
  const logs = await getWorkoutLogs();

  const matchingLogs = logs.filter((log) => log.date === date);

  if (matchingLogs.length === 0) {
    return null;
  }

  return matchingLogs[matchingLogs.length - 1];
}

function buildSheetRows(workoutLog: WorkoutLog): string[][] {
  if (workoutLog.exercises.length === 0) {
    return [
      [
        workoutLog.date,
        String(workoutLog.workoutDay),
        String(workoutLog.completed),
        "",
        "",
        "",
        "",
        "",
        workoutLog.notes,
      ],
    ];
  }

  return workoutLog.exercises.map((exercise) => [
    workoutLog.date,
    String(workoutLog.workoutDay),
    String(workoutLog.completed),
    exercise.exerciseId,
    String(exercise.completed),
    exercise.actualSets === null ? "" : String(exercise.actualSets),
    exercise.actualReps ?? "",
    exercise.notes,
    workoutLog.notes,
  ]);
}

export async function saveWorkoutLog(
  workoutLog: WorkoutLog
): Promise<WorkoutLog> {
  const existingRows = await getWorkoutLogsSheet();

  const dataRows = existingRows.slice(1);

  const matchingRowIndexes: number[] = [];

  dataRows.forEach((row, index) => {
    const date = String(row[0] ?? "").trim();
    const workoutDay = Number(row[1]);

    if (
      date === workoutLog.date &&
      workoutDay === workoutLog.workoutDay
    ) {
      // Google Sheets row numbers start at 2 because row 1 is the header.
      matchingRowIndexes.push(index + 2);
    }
  });

  const newRows = buildSheetRows(workoutLog);

  if (matchingRowIndexes.length === 0) {
    await appendWorkoutLogsSheet(newRows);

    return workoutLog;
  }

  const firstMatchingRow = Math.min(...matchingRowIndexes);
  const lastMatchingRow = Math.max(...matchingRowIndexes);

  // Remove the previous version of this workout.
  await clearWorkoutLogRows(
    firstMatchingRow,
    lastMatchingRow
  );

  // Append the latest version.
  await appendWorkoutLogsSheet(newRows);

  return workoutLog;
}