import { getHealthSnapshot } from "@/lib/health/data";
import { getHealthSummary } from "@/lib/health/summary";
import { CheckInForm } from "@/components/check-in/CheckInForm";
import { MeasurementsForm } from "@/components/check-in/MeasurementsForm";
export const dynamic = "force-dynamic";

function formatWeight(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }

  return `${value.toFixed(1)} kg`;
}

function formatNumber(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(1);
}

function formatPercentage(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }

  return `${value.toFixed(0)}%`;
}

function formatChange(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }

  if (value > 0) {
    return `+${value.toFixed(1)} kg`;
  }

  return `${value.toFixed(1)} kg`;
}

export default async function CheckInPage() {
  const snapshot = await getHealthSnapshot();
  const summary = await getHealthSummary(snapshot);

  const currentWeight = summary.currentWeightKg;
  const startingWeight = summary.startingWeightKg;
  const goalWeight = summary.goalWeightKg;

  const progressPercentage =
    startingWeight != null &&
    currentWeight != null &&
    goalWeight != null &&
    Number.isFinite(startingWeight) &&
    Number.isFinite(currentWeight) &&
    Number.isFinite(goalWeight) &&
    startingWeight > goalWeight
      ? Math.min(
          100,
          Math.max(
            0,
            ((startingWeight - currentWeight) /
              (startingWeight - goalWeight)) *
              100
          )
        )
      : 0;

  const latestWeightEntries = snapshot.weight
    .filter((entry) => entry.weightKg != null)
    .slice(-7);

  const latestMeasurements =
    summary.latestWeek != null
      ? snapshot.measurements[summary.latestWeek]
      : undefined;

  const latestWellness =
    summary.latestWeek != null
      ? snapshot.wellness[summary.latestWeek]
      : undefined;

  const latestAdherence =
    summary.latestWeek != null
      ? snapshot.adherence[summary.latestWeek]
      : undefined;

  const latestWeeklyProgress =
    summary.latestWeek != null
      ? snapshot.weeklyProgress.find(
          (week) => week.week === summary.latestWeek
        )
      : undefined;

  return (
    <div className="page check-in-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Daily Tracking</p>

          <h1 className="page-title">Check-in</h1>

          <p className="page-description">
            Track your weight, measurements, wellness, and adherence
            throughout your transformation.
          </p>
        </div>
      </div>
    <CheckInForm />
    <MeasurementsForm />
      {/* Overview */}
      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Overview</p>
            <h2 className="section-title">Your Progress</h2>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-label">Current Weight</span>

            <strong className="metric-value">
              {formatWeight(currentWeight)}
            </strong>

            <span className="metric-subtitle">
              Goal: {formatWeight(goalWeight)}
            </span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Starting Weight</span>

            <strong className="metric-value">
              {formatWeight(startingWeight)}
            </strong>

            <span className="metric-subtitle">
              Initial recorded weight
            </span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Total Change</span>

            <strong className="metric-value">
              {formatChange(summary.totalWeightChangeKg)}
            </strong>

            <span className="metric-subtitle">
              Since your first check-in
            </span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Remaining to Goal</span>

            <strong className="metric-value">
              {formatWeight(summary.weightToGoal)}
            </strong>

            <span className="metric-subtitle">
              Target: {formatWeight(goalWeight)}
            </span>
          </div>
        </div>
      </section>

      {/* Goal Progress */}
      <section className="check-in-goal-panel">
        <div className="check-in-goal-header">
          <div>
            <p className="eyebrow">Transformation</p>
            <h2 className="section-title">Goal Progress</h2>
          </div>

          <strong className="check-in-progress-value">
            {progressPercentage.toFixed(0)}%
          </strong>
        </div>

        <div className="check-in-progress-track">
          <div
            className="check-in-progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="check-in-goal-meta">
          <span>Start: {formatWeight(startingWeight)}</span>

          <span>Goal: {formatWeight(goalWeight)}</span>
        </div>
      </section>

      {/* Latest Check-in */}
      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Latest</p>
            <h2 className="section-title">Latest Check-in</h2>
          </div>

          {summary.latestWeek != null && (
            <span className="check-in-week-badge">
              Week {summary.latestWeek}
            </span>
          )}
        </div>

        <div className="check-in-grid">
          {/* Weight */}
          <div className="panel check-in-summary-panel">
            <div className="check-in-panel-header">
              <div>
                <p className="eyebrow">Weight</p>

                <h3 className="check-in-panel-title">
                  Latest Weight Data
                </h3>
              </div>
            </div>

            <div className="check-in-stat-list">
              <div className="check-in-stat-row">
                <span>Current weight</span>

                <strong>{formatWeight(currentWeight)}</strong>
              </div>

              <div className="check-in-stat-row">
                <span>Weekly average</span>

                <strong>
                  {formatWeight(
                    latestWeeklyProgress?.averageWeightKg
                  )}
                </strong>
              </div>

              <div className="check-in-stat-row">
                <span>Weekly change</span>

                <strong>
                  {formatChange(summary.latestWeeklyChangeKg)}
                </strong>
              </div>
            </div>
          </div>

          {/* Daily Weight Entries */}
          <div className="panel check-in-summary-panel">
            <div className="check-in-panel-header">
              <div>
                <p className="eyebrow">Week</p>

                <h3 className="check-in-panel-title">
                  Daily Weight Entries
                </h3>
              </div>
            </div>

            {latestWeightEntries.length === 0 ? (
              <p className="muted">
                No weight entries have been recorded yet.
              </p>
            ) : (
              <div className="check-in-weight-list">
                {latestWeightEntries.map((entry) => (
                  <div
                    className="check-in-weight-row"
                    key={`${entry.week}-${entry.day}`}
                  >
                    <span>
                      Week {entry.week} · Day {entry.day}
                    </span>

                    <strong>
                      {formatWeight(entry.weightKg)}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BMI */}
          <div className="panel check-in-summary-panel">
            <div className="check-in-panel-header">
              <div>
                <p className="eyebrow">Body Composition</p>

                <h3 className="check-in-panel-title">
                  BMI
                </h3>
              </div>
            </div>

            <div className="check-in-stat-list">
              <div className="check-in-stat-row">
                <span>BMI</span>

                <strong>
                  {summary.bmi == null
                    ? "—"
                    : summary.bmi.toFixed(1)}
                </strong>
              </div>

              <div className="check-in-stat-row">
                <span>Category</span>

                <strong>
                  {summary.bmiCategory || "—"}
                </strong>
              </div>

              <div className="check-in-stat-row">
                <span>Height</span>

                <strong>
                  {Number.isFinite(summary.heightCm)
                    ? `${summary.heightCm.toFixed(0)} cm`
                    : "—"}
                </strong>
              </div>

              <div className="check-in-stat-row">
                <span>Current weight</span>

                <strong>
                  {formatWeight(currentWeight)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Measurements */}
      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Body</p>
            <h2 className="section-title">Measurements</h2>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-label">Right Biceps</span>

            <strong className="metric-value">
              {formatNumber(latestMeasurements?.rightBicepsIn)}"
            </strong>

            <span className="metric-subtitle">
              Latest measurement
            </span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Left Biceps</span>

            <strong className="metric-value">
              {formatNumber(latestMeasurements?.leftBicepsIn)}"
            </strong>

            <span className="metric-subtitle">
              Latest measurement
            </span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Chest</span>

            <strong className="metric-value">
              {formatNumber(latestMeasurements?.chestIn)}"
            </strong>

            <span className="metric-subtitle">
              Latest measurement
            </span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Right Thigh</span>

            <strong className="metric-value">
              {formatNumber(latestMeasurements?.rightThighIn)}"
            </strong>

            <span className="metric-subtitle">
              Latest measurement
            </span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Left Thigh</span>

            <strong className="metric-value">
              {formatNumber(latestMeasurements?.leftThighIn)}"
            </strong>

            <span className="metric-subtitle">
              Latest measurement
            </span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Waist</span>

            <strong className="metric-value">
              {formatNumber(latestMeasurements?.waistIn)}"
            </strong>

            <span className="metric-subtitle">
              Latest measurement
            </span>
          </div>
        </div>
      </section>

      {/* Wellness */}
      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Wellness</p>
            <h2 className="section-title">
              How You&apos;re Feeling
            </h2>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-label">Sleep Issues</span>

            <strong className="metric-value">
              {formatPercentage(latestWellness?.sleepIssues)}
            </strong>

            <span className="metric-subtitle">
              Latest recorded value
            </span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Hunger Issues</span>

            <strong className="metric-value">
              {formatPercentage(latestWellness?.hungerIssues)}
            </strong>

            <span className="metric-subtitle">
              Latest recorded value
            </span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Stress Issues</span>

            <strong className="metric-value">
              {formatPercentage(latestWellness?.stressIssues)}
            </strong>

            <span className="metric-subtitle">
              Latest recorded value
            </span>
          </div>
        </div>
      </section>

      {/* Adherence */}
      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Consistency</p>
            <h2 className="section-title">Adherence</h2>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-label">Diet</span>

            <strong className="metric-value">
              {formatPercentage(latestAdherence?.diet)}
            </strong>

            <span className="metric-subtitle">
              Latest recorded adherence
            </span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Workout</span>

            <strong className="metric-value">
              {formatPercentage(latestAdherence?.workout)}
            </strong>

            <span className="metric-subtitle">
              Latest recorded adherence
            </span>
          </div>
        </div>
      </section>

      {/* Weekly History */}
      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">History</p>
            <h2 className="section-title">Weekly Progress</h2>
          </div>
        </div>

        <div className="panel check-in-history-panel">
          {snapshot.weeklyProgress.length === 0 ? (
            <p className="muted">
              No weekly progress data available yet.
            </p>
          ) : (
            <div className="check-in-history-table">
              <div className="check-in-history-header">
                <span>Week</span>
                <span>Average Weight</span>
                <span>Weekly Change</span>
              </div>

              {snapshot.weeklyProgress.map((week) => (
                <div
                  className="check-in-history-row"
                  key={week.week}
                >
                  <span>Week {week.week}</span>

                  <strong>
                    {formatWeight(week.averageWeightKg)}
                  </strong>

                  <span
                    className={
                      week.weightChangeKg != null &&
                      week.weightChangeKg < 0
                        ? "check-in-positive-change"
                        : ""
                    }
                  >
                    {formatChange(week.weightChangeKg)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}