export type BmiResult = {
  bmi: number | null;
  category: string;
};

export function calculateBmi(
  weightKg: number | null | undefined,
  heightCm: number | null | undefined
): BmiResult {
  if (
    weightKg == null ||
    heightCm == null ||
    !Number.isFinite(weightKg) ||
    !Number.isFinite(heightCm) ||
    weightKg <= 0 ||
    heightCm <= 0
  ) {
    return {
      bmi: null,
      category: "—",
    };
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  return {
    bmi: Number(bmi.toFixed(1)),
    category: getBmiCategory(bmi),
  };
}

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obesity";
}