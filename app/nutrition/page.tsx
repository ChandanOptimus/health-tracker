import {
  Coffee,
  Moon,
  Utensils,
} from "lucide-react";

import { Panel } from "@/components/ui/Panel";
import { MealOption } from "@/components/nutrition/MealOptions";

import {
  getDietSheet,
} from "@/lib/health/google-sheets";

import {
  parseDietSheet,
} from "@/lib/health/diet";

import { MealPlanSection } from "@/types/nutrition";

export const dynamic = "force-dynamic";

export default async function NutritionPage() {
  const rows =
    await getDietSheet();

  const nutrition =
    parseDietSheet(rows);

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-7">
        <div className="text-sm muted">
          Nutrition
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Meal plan
        </h1>

        <p className="mt-2 max-w-2xl text-sm muted">
          Your diet plan directly from the
          workbook.
        </p>
      </header>

      {/* Target */}

      <div className="grid gap-4 sm:grid-cols-3">
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5">
              <Utensils size={18} />
            </div>

            <div>
              <div className="text-xs muted">
                Daily target
              </div>

              <div className="mt-1 text-2xl font-semibold">
                {nutrition.calorieTarget ===
                null
                  ? "—"
                  : `${nutrition.calorieTarget.toLocaleString()} kcal`}
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5">
              <Coffee size={18} />
            </div>

            <div>
              <div className="text-xs muted">
                Meals
              </div>

              <div className="mt-1 text-2xl font-semibold">
                {nutrition.meals.length}
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5">
              <Moon size={18} />
            </div>

            <div>
              <div className="text-xs muted">
                Plan
              </div>

              <div className="mt-1 text-2xl font-semibold">
                3 meals
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Meals */}

      <div className="mt-7 space-y-7">
        {nutrition.meals.map(
          (meal) => (
            <MealSectionView
              key={meal.type}
              meal={meal}
            />
          ),
        )}
      </div>

      {/* Guidelines */}

      {nutrition.guidelines.length >
        0 && (
        <Panel className="mt-7 p-6">
          <h2 className="text-xl font-semibold">
            General diet guidelines
          </h2>

          <ul className="mt-5 space-y-3">
            {nutrition.guidelines.map(
              (item, index) => (
                <li
                  key={index}
                  className="flex gap-3 text-sm leading-6 text-white/75"
                >
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-white/40" />

                  <span>{item}</span>
                </li>
              ),
            )}
          </ul>
        </Panel>
      )}

      {/* Supplements */}

      {nutrition.supplements.length >
        0 && (
        <Panel className="mt-5 p-6">
          <h2 className="text-xl font-semibold">
            Supplements
          </h2>

          <ul className="mt-5 space-y-3">
            {nutrition.supplements.map(
              (item, index) => (
                <li
                  key={index}
                  className="text-sm text-white/75"
                >
                  {item}
                </li>
              ),
            )}
          </ul>
        </Panel>
      )}
    </div>
  );
}

function MealSectionView({
  meal,
}: {
  meal: MealPlanSection;
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">
          {meal.title}
        </h2>

        <p className="mt-1 text-sm muted">
          Choose one of the options below.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {meal.options.map(
          (option, index) => (
            <div key={option.id}>
              {index > 0 && (
                <div className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-white/30 xl:hidden">
                  OR
                </div>
              )}

              <MealOption
                option={option}
              />
            </div>
          ),
        )}
      </div>
    </section>
  );
}