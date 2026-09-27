export type MealSection =
  | "breakfast"
  | "lunch"
  | "snacks"
  | "dinner";

export type MealOption = {
  id: string;
  items: string[];
  macros?: {
    protein?: number;
    carbs?: number;
    fats?: number;
  };
};

export type MealPlanSection = {
  type: MealSection;
  title: string;
  options: MealOption[];
};

export type NutritionPlan = {
  calorieTarget: number | null;
  meals: MealPlanSection[];
  guidelines: string[];
  supplements: string[];
};