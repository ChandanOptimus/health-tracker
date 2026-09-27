import { HealthSnapshot } from "@/types/health";
import { calculateWeeklyProgress } from "./calculations";
import {
  parseAdherence,
  parseMeasurements,
  parseWellness,
  parseWeightEntries,
} from "./sheets";
import {
  getCheckInSheet,
  getHealthProfile,
} from "./google-sheets";

export async function getHealthSnapshot(): Promise<HealthSnapshot> {
  const [checkInRows, profile] = await Promise.all([
    getCheckInSheet(),
    getHealthProfile(),
  ]);

  const weight = parseWeightEntries(checkInRows);

  const hasCheckInWeight = weight.some(
    (entry) =>
      entry.weightKg != null &&
      Number.isFinite(entry.weightKg)
  );

  const currentWeightKg = hasCheckInWeight
    ? weight
        .filter(
          (entry) =>
            entry.weightKg != null &&
            Number.isFinite(entry.weightKg)
        )
        .at(-1)?.weightKg ?? profile.currentWeightKg
    : profile.currentWeightKg;

  const weeklyProgress = calculateWeeklyProgress(weight);
  const measurements = parseMeasurements(checkInRows);
  const wellness = parseWellness(checkInRows);
  const adherence = parseAdherence(checkInRows);

  return {
    currentWeightKg,
    heightCm: profile.heightCm,
    goalWeightKg: profile.goalWeightKg,
    weight,
    weeklyProgress,
    measurements,
    wellness,
    adherence,
  };
}