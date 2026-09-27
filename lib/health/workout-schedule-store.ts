import {
  getWorkoutScheduleSheet,
  updateWorkoutScheduleSheet,
} from "@/lib/health/google-sheets";
import {
  WEEKDAYS,
  Weekday,
  WeeklyWorkoutSchedule,
} from "@/types/workout-schedule";

const DEFAULT_SCHEDULE: WeeklyWorkoutSchedule = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: null,
};

function normalizeWorkoutDay(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 7) {
    return null;
  }

  return parsed;
}

export async function getWorkoutSchedule(): Promise<WeeklyWorkoutSchedule> {
  const rows = await getWorkoutScheduleSheet();

  if (rows.length < 2) {
    return DEFAULT_SCHEDULE;
  }

  const schedule: WeeklyWorkoutSchedule = {
    ...DEFAULT_SCHEDULE,
  };

  for (const row of rows.slice(1)) {
    const weekday = String(row[0] ?? "")
      .trim()
      .toLowerCase() as Weekday;

    if (!WEEKDAYS.includes(weekday)) {
      continue;
    }

    schedule[weekday] = normalizeWorkoutDay(row[1]);
  }

  return schedule;
}

export async function saveWorkoutSchedule(
  schedule: WeeklyWorkoutSchedule
): Promise<WeeklyWorkoutSchedule> {
  const values: string[][] = [
    ["Weekday", "Workout Day"],
    ...WEEKDAYS.map((weekday) => [
      weekday.charAt(0).toUpperCase() + weekday.slice(1),
      schedule[weekday] === null ? "" : String(schedule[weekday]),
    ]),
  ];

  await updateWorkoutScheduleSheet(values);

  return schedule;
}