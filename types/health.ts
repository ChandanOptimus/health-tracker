export type NullableNumber = number | null;

export type WeightEntry = {
  week: number;
  day: number;
  weightKg: NullableNumber;
};

export type WeeklyProgress = {
  week: number;
  averageWeightKg: NullableNumber;
  weightChangeKg: NullableNumber;
};

export type Measurements = {
  rightBicepsIn: NullableNumber;
  leftBicepsIn: NullableNumber;
  chestIn: NullableNumber;
  rightThighIn: NullableNumber;
  leftThighIn: NullableNumber;
  waistIn: NullableNumber;
};

export type WellnessScores = {
  sleepIssues: NullableNumber;
  hungerIssues: NullableNumber;
  stressIssues: NullableNumber;
};

export type Adherence = {
  diet: NullableNumber;
  workout: NullableNumber;
};

export type HealthSnapshot = {
  weight: WeightEntry[];
  weeklyProgress: WeeklyProgress[];
  measurements: Record<number, Measurements>;
  wellness: Record<number, WellnessScores>;
  adherence: Record<number, Adherence>;
  heightCm: number;
  currentWeightKg: number;
  goalWeightKg: number;
};