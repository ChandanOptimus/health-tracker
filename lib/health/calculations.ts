import {
  WeightEntry,
  WeeklyProgress,
} from "@/types/health";

export function calculateWeeklyProgress(
  entries: WeightEntry[],
): WeeklyProgress[] {
  const weeklyWeights =
    new Map<number, number[]>();

  for (const entry of entries) {
    if (entry.weightKg === null) {
      continue;
    }

    const values =
      weeklyWeights.get(entry.week) ?? [];

    values.push(entry.weightKg);

    weeklyWeights.set(
      entry.week,
      values,
    );
  }

  const result: WeeklyProgress[] = [];

  let previousAverage: number | null =
    null;

  for (
    let week = 1;
    week <= 48;
    week++
  ) {
    const values =
      weeklyWeights.get(week) ?? [];

    const averageWeightKg =
      values.length > 0
        ? values.reduce(
            (sum, value) =>
              sum + value,
            0,
          ) / values.length
        : null;

    const weightChangeKg =
      averageWeightKg !== null &&
      previousAverage !== null
        ? averageWeightKg -
          previousAverage
        : null;

    if (averageWeightKg !== null) {
      previousAverage =
        averageWeightKg;
    }

    result.push({
      week,
      averageWeightKg,
      weightChangeKg,
    });
  }

  return result;
}

export function getLatestWeight(
  entries: WeightEntry[],
): number | null {
  for (
    let i = entries.length - 1;
    i >= 0;
    i--
  ) {
    const weight =
      entries[i].weightKg;

    if (weight !== null) {
      return weight;
    }
  }

  return null;
}

export function getStartingWeight(
  entries: WeightEntry[],
): number | null {
  for (const entry of entries) {
    if (entry.weightKg !== null) {
      return entry.weightKg;
    }
  }

  return null;
}

export function getWeightLost(
  startingWeight: number | null,
  currentWeight: number | null,
): number | null {
  if (
    startingWeight === null ||
    currentWeight === null
  ) {
    return null;
  }

  return startingWeight - currentWeight;
}