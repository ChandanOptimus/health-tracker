import { HealthSnapshot } from "@/types/health";
import { calculateBmi } from "./bmi";
import {
  getLatestWeight,
  getStartingWeight,
} from "./calculations";

export type HealthSummary = {
  // Current names used by Check-in
  currentWeight: number | null;
  startingWeight: number | null;
  goalWeight: number | null;
  weightToGoal: number | null;
  totalWeightChange: number | null;
  latestWeek: number | null;
  latestWeeklyChange: number | null;

  // Backward-compatible names used by Dashboard
  currentWeightKg: number | null;
  startingWeightKg: number | null;
  goalWeightKg: number;
  totalWeightChangeKg: number | null;
  latestWeeklyChangeKg: number | null;

  // Profile / BMI
  heightCm: number;
  bmi: number | null;
  bmiCategory: string;

  // Wellness / adherence
  dietAdherence: number | null;
  workoutAdherence: number | null;
  sleepIssues: number | null;
  hungerIssues: number | null;
  stressIssues: number | null;
};

export async function getHealthSummary(
  snapshot: HealthSnapshot
): Promise<HealthSummary> {
  const latestCheckInWeight = getLatestWeight(snapshot.weight);

  /*
   * Current weight priority:
   *
   * 1. Latest Check-in weight
   * 2. Profile current weight
   */
  const currentWeight =
    latestCheckInWeight != null
      ? latestCheckInWeight
      : snapshot.currentWeightKg;

  /*
   * Starting weight:
   *
   * If there is no Check-in history yet,
   * use the Profile current weight.
   */
  const recordedStartingWeight = getStartingWeight(snapshot.weight);

  const startingWeight =
    recordedStartingWeight != null
      ? recordedStartingWeight
      : snapshot.currentWeightKg;

  const latestProgress =
    snapshot.weeklyProgress.length > 0
      ? snapshot.weeklyProgress[
          snapshot.weeklyProgress.length - 1
        ]
      : null;

  const latestWeek = latestProgress?.week ?? null;

  const latestWeeklyChange =
    latestProgress?.weightChangeKg ?? null;

  /*
   * Current weight - goal weight.
   *
   * Example:
   * Current = 81 kg
   * Goal = 68 kg
   * Result = 13 kg
   */
  const weightToGoal =
    currentWeight != null
      ? currentWeight - snapshot.goalWeightKg
      : null;

  /*
   * No recorded Check-in history means
   * there is no actual weight change yet.
   */
  const totalWeightChange =
    recordedStartingWeight != null && currentWeight != null
      ? currentWeight - recordedStartingWeight
      : 0;

  const latestAdherence = getLatestRecord(snapshot.adherence);
  const latestWellness = getLatestRecord(snapshot.wellness);

  const bmiResult = calculateBmi(
    currentWeight,
    snapshot.heightCm
  );

  return {
    // Check-in names
    currentWeight,
    startingWeight,
    goalWeight: snapshot.goalWeightKg,
    weightToGoal,
    totalWeightChange,
    latestWeek,
    latestWeeklyChange,

    // Dashboard-compatible names
    currentWeightKg: currentWeight,
    startingWeightKg: startingWeight,
    goalWeightKg: snapshot.goalWeightKg,
    totalWeightChangeKg: totalWeightChange,
    latestWeeklyChangeKg: latestWeeklyChange,

    // BMI
    heightCm: snapshot.heightCm,
    bmi: bmiResult.bmi,
    bmiCategory: bmiResult.category,

    // Wellness / adherence
    dietAdherence: latestAdherence?.diet ?? null,
    workoutAdherence: latestAdherence?.workout ?? null,
    sleepIssues: latestWellness?.sleepIssues ?? null,
    hungerIssues: latestWellness?.hungerIssues ?? null,
    stressIssues: latestWellness?.stressIssues ?? null,
  };
}

function getLatestRecord<T>(
  records: Record<number, T>
): T | null {
  const weeks = Object.keys(records)
    .map(Number)
    .filter(Number.isFinite)
    .sort((a, b) => b - a);

  if (weeks.length === 0) {
    return null;
  }

  return records[weeks[0]] ?? null;
}