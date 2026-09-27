import {
  Scale,
  Target,
  TrendingDown,
} from "lucide-react";

import { Panel } from "@/components/ui/Panel";

import { WeightChart } from "@/components/charts/WeightChart";

import { MeasurementChart } from "@/components/charts/MeasurementChart";

import { WeightChangeChart } from "@/components/charts/WeightChangeChart";

import {
  getHealthSnapshot,
} from "@/lib/health/data";

import {
  getHealthSummary,
} from "@/lib/health/summary";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const healthData =
    await getHealthSnapshot();

 const summary = await getHealthSummary(healthData);
  const measurementSeries = {
    rightBiceps: createMeasurementSeries(
      healthData,
      "rightBicepsIn",
    ),

    leftBiceps: createMeasurementSeries(
      healthData,
      "leftBicepsIn",
    ),

    chest: createMeasurementSeries(
      healthData,
      "chestIn",
    ),

    rightThigh: createMeasurementSeries(
      healthData,
      "rightThighIn",
    ),

    leftThigh: createMeasurementSeries(
      healthData,
      "leftThighIn",
    ),

    waist: createMeasurementSeries(
      healthData,
      "waistIn",
    ),
  };

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-7">
        <div className="text-sm muted">
          Progress
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Weight & body progress
        </h1>

        <p className="mt-2 max-w-2xl text-sm muted">
          Track your weight, measurements and
          progress across the 48-week plan.
        </p>
      </header>

      {/* Summary */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ProgressCard
          icon={<Scale size={18} />}
          label="Current weight"
          value={
            summary.currentWeightKg === null
              ? "—"
              : `${summary.currentWeightKg.toFixed(1)} kg`
          }
          sub={
            summary.latestWeek === null
              ? "No data"
              : `Week ${summary.latestWeek}`
          }
        />

        <ProgressCard
          icon={<Target size={18} />}
          label="Goal weight"
          value={`${summary.goalWeightKg} kg`}
          sub="Target"
        />

        <ProgressCard
          icon={<TrendingDown size={18} />}
          label="Total change"
          value={
            summary.totalWeightChangeKg === null
              ? "—"
              : `${summary.totalWeightChangeKg > 0 ? "-" : "+"}${Math.abs(
                  summary.totalWeightChangeKg,
                ).toFixed(1)} kg`
          }
          sub="From first weigh-in"
        />

        <ProgressCard
          icon={<TrendingDown size={18} />}
          label="Latest weekly change"
          value={
            summary.latestWeeklyChangeKg === null
              ? "—"
              : `${summary.latestWeeklyChangeKg > 0 ? "+" : ""}${summary.latestWeeklyChangeKg.toFixed(
                  2,
                )} kg`
          }
          sub={
            summary.latestWeek === null
              ? "No weekly data"
              : `Week ${summary.latestWeek}`
          }
        />
      </div>

      {/* Weight charts */}

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel className="p-5">
          <div>
            <h2 className="font-semibold">
              Weekly average weight
            </h2>

            <p className="mt-1 text-xs muted">
              Average of available daily weigh-ins
            </p>
          </div>

          <div className="mt-4">
            <WeightChart
              data={
                healthData.weeklyProgress
              }
            />
          </div>
        </Panel>

        <Panel className="p-5">
          <div>
            <h2 className="font-semibold">
              Weekly weight change
            </h2>

            <p className="mt-1 text-xs muted">
              Change from the previous available
              weekly average
            </p>
          </div>

          <div className="mt-4">
            <WeightChangeChart
              data={
                healthData.weeklyProgress
              }
            />
          </div>
        </Panel>
      </div>

      {/* Body measurements */}

      <div className="mt-5">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            Body measurements
          </h2>

          <p className="mt-1 text-sm muted">
            Track how your measurements change
            throughout the plan.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <MeasurementPanel
            title="Right biceps"
            data={
              measurementSeries.rightBiceps
            }
          />

          <MeasurementPanel
            title="Left biceps"
            data={
              measurementSeries.leftBiceps
            }
          />

          <MeasurementPanel
            title="Chest"
            data={
              measurementSeries.chest
            }
          />

          <MeasurementPanel
            title="Waist"
            data={
              measurementSeries.waist
            }
          />

          <MeasurementPanel
            title="Right thigh"
            data={
              measurementSeries.rightThigh
            }
          />

          <MeasurementPanel
            title="Left thigh"
            data={
              measurementSeries.leftThigh
            }
          />
        </div>
      </div>

      {/* Timeline */}

      <Panel className="mt-5 overflow-hidden">
        <div className="border-b border-white/5 px-5 py-4">
          <h2 className="font-semibold">
            48-week timeline
          </h2>

          <p className="mt-1 text-xs muted">
            Weekly progress from your Check-in
            sheet.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-px bg-white/5 sm:grid-cols-8 lg:grid-cols-12">
          {healthData.weeklyProgress.map(
            (week) => (
              <div
                key={week.week}
                className="bg-[#10151b] p-3"
              >
                <div className="text-xs muted">
                  W{week.week}
                </div>

                <div className="mt-2 text-sm font-medium">
                  {week.averageWeightKg ===
                  null
                    ? "—"
                    : `${week.averageWeightKg.toFixed(
                        1,
                      )} kg`}
                </div>

                {week.weightChangeKg !==
                  null && (
                  <div className="mt-1 text-[11px] muted">
                    {week.weightChangeKg > 0
                      ? "+"
                      : ""}
                    {week.weightChangeKg.toFixed(
                      2,
                    )}
                  </div>
                )}
              </div>
            ),
          )}
        </div>
      </Panel>
    </div>
  );
}

function createMeasurementSeries(
  healthData: Awaited<
    ReturnType<typeof getHealthSnapshot>
  >,
  key:
    | "rightBicepsIn"
    | "leftBicepsIn"
    | "chestIn"
    | "rightThighIn"
    | "leftThighIn"
    | "waistIn",
) {
  return Array.from(
    { length: 48 },
    (_, index) => {
      const week = index + 1;

      return {
        week,
        value:
          healthData.measurements[week]?.[
            key
          ] ?? null,
      };
    },
  );
}

function ProgressCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="panel metric">
      <div className="flex items-center justify-between">
        <span className="text-sm muted">
          {label}
        </span>

        {icon}
      </div>

      <div className="mt-4 text-2xl font-semibold tracking-tight">
        {value}
      </div>

      <div className="mt-1 text-xs muted">
        {sub}
      </div>
    </div>
  );
}

function MeasurementPanel({
  title,
  data,
}: {
  title: string;
  data: {
    week: number;
    value: number | null;
  }[];
}) {
  return (
    <Panel className="p-5">
      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="mt-1 text-xs muted">
        Inches · weekly measurements
      </p>

      <div className="mt-4">
        <MeasurementChart
          data={data}
          label={title}
          unit="in"
        />
      </div>
    </Panel>
  );
}