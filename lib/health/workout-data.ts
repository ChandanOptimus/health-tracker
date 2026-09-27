import {
  WorkoutPlan,
} from "@/types/workout";

import {
  getWorkoutSheet,
} from "./google-sheets";

import {
  parseWorkoutSheet,
} from "./workout";

export async function getWorkoutPlan(): Promise<WorkoutPlan> {
  const rows =
    await getWorkoutSheet();

  return parseWorkoutSheet(rows);
}