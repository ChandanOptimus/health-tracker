import {
  Activity,
  Dumbbell,
  Scale,
  Target,
  TrendingDown,
  Utensils,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/MetricCard";
import { WeightChart } from "@/components/charts/WeightChart";
import { Panel } from "@/components/ui/Panel";

import { getHealthSnapshot } from "@/lib/health/data";
import { getHealthSummary } from "@/lib/health/summary";

export const dynamic = "force-dynamic";

function formatWeight(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }

  return `${value.toFixed(1)} kg`;
}

function formatPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }

  return `${value.toFixed(0)}%`;
}

export default async function DashboardPage() {
  const healthData = await getHealthSnapshot();

  const summary = await getHealthSummary(healthData);

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-7">
        <div className="text-sm muted">Health Tracker</div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Dashboard
        </h1>

        <p className="mt-2 max-w-2xl text-sm muted">
          Your health, nutrition, workout and progress data in one place.
        </p>
      </header>

      {/* Main metrics */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Current weight"
          value={formatWeight(summary.currentWeightKg)}
          sub={
            summary.latestWeek === null
              ? "Profile weight"
              : `Latest · Week ${summary.latestWeek}`
          }
          icon={<Scale size={18} />}
        />

        <MetricCard
          label="Goal weight"
          value={formatWeight(summary.goalWeightKg)}
          sub="Target weight"
          icon={<Target size={18} />}
        />

        <MetricCard
          label="Weight to goal"
          value={
            summary.weightToGoal === null
              ? "—"
              : `${Math.max(0, summary.weightToGoal).toFixed(1)} kg`
          }
          sub={
            summary.weightToGoal === null
              ? "Waiting for weight"
              : summary.weightToGoal <= 0
                ? "Goal reached"
                : "Remaining"
          }
          icon={<TrendingDown size={18} />}
        />

        <MetricCard
          label="Total change"
          value={
            summary.totalWeightChangeKg === null
              ? "—"
              : `${summary.totalWeightChangeKg > 0 ? "+" : ""}${summary.totalWeightChangeKg.toFixed(
                  1,
                )} kg`
          }
          sub={
            summary.totalWeightChangeKg === 0
              ? "No change recorded yet"
              : "Since first weigh-in"
          }
          icon={<Activity size={18} />}
        />
      </div>

      {/* BMI */}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="BMI"
          value={
            summary.bmi == null
              ? "—"
              : summary.bmi.toFixed(1)
          }
          sub={
            summary.bmiCategory === "—"
              ? "Waiting for weight"
              : summary.bmiCategory
          }
          icon={<Scale size={18} />}
        />

        <MetricCard
          label="Height"
          value={
            Number.isFinite(summary.heightCm)
              ? `${summary.heightCm.toFixed(0)} cm`
              : "—"
          }
          sub="Profile height"
          icon={<Activity size={18} />}
        />

        <MetricCard
          label="Weight remaining"
          value={
            summary.weightToGoal == null
              ? "—"
              : `${Math.max(0, summary.weightToGoal).toFixed(1)} kg`
          }
          sub="To reach your goal"
          icon={<Target size={18} />}
        />
      </div>

      {/* Progress */}

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <Panel className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold">Weight trend</h2>

              <p className="mt-1 text-xs muted">
                Weekly average · 48-week plan
              </p>
            </div>

            {summary.latestWeeklyChangeKg != null && (
              <div className="rounded-full border border-white/10 px-3 py-1 text-xs">
                {summary.latestWeeklyChangeKg > 0 ? "+" : ""}
                {summary.latestWeeklyChangeKg.toFixed(2)} kg
              </div>
            )}
          </div>

          <div className="mt-4">
            <WeightChart data={healthData.weeklyProgress} />
          </div>
        </Panel>

        {/* Latest check-in */}

        <Panel className="p-5">
          <h2 className="font-semibold">Latest check-in</h2>

          <p className="mt-1 text-xs muted">
            Your most recent available data.
          </p>

          <div className="mt-6 space-y-3">
            <SummaryRow
              label="Current weight"
              value={formatWeight(summary.currentWeightKg)}
            />

            <SummaryRow
              label="Goal weight"
              value={formatWeight(summary.goalWeightKg)}
            />

            <SummaryRow
              label="BMI"
              value={
                summary.bmi == null
                  ? "—"
                  : `${summary.bmi.toFixed(1)} · ${summary.bmiCategory}`
              }
            />

            <SummaryRow
              label="Week"
              value={
                summary.latestWeek === null
                  ? "—"
                  : `Week ${summary.latestWeek}`
              }
            />

            <SummaryRow
              label="Diet adherence"
              value={formatPercent(summary.dietAdherence)}
            />

            <SummaryRow
              label="Workout adherence"
              value={formatPercent(summary.workoutAdherence)}
            />

            <SummaryRow
              label="Sleep issues"
              value={
                summary.sleepIssues === null
                  ? "—"
                  : `${summary.sleepIssues}/5`
              }
            />

            <SummaryRow
              label="Hunger issues"
              value={
                summary.hungerIssues === null
                  ? "—"
                  : `${summary.hungerIssues}/5`
              }
            />

            <SummaryRow
              label="Stress issues"
              value={
                summary.stressIssues === null
                  ? "—"
                  : `${summary.stressIssues}/5`
              }
            />
          </div>
        </Panel>
      </div>

      {/* Quick overview */}

      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5">
              <Utensils size={18} />
            </div>

            <div>
              <div className="text-sm muted">Nutrition</div>

              <div className="mt-1 text-xl font-semibold">
                1,650 kcal
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs muted">
            Daily target from your diet plan.
          </p>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5">
              <Dumbbell size={18} />
            </div>

            <div>
              <div className="text-sm muted">Workout</div>

              <div className="mt-1 text-xl font-semibold">
                7-day split
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs muted">
            Your workout plan from the workbook.
          </p>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5">
              <Activity size={18} />
            </div>

            <div>
              <div className="text-sm muted">Tracking</div>

              <div className="mt-1 text-xl font-semibold">
                48 weeks
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs muted">
            Your complete progress timeline.
          </p>
        </Panel>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[.02] px-4 py-3">
      <span className="text-sm">{label}</span>

      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}