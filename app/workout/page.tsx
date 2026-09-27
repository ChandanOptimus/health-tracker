import { getWorkoutPlan } from "@/lib/health/workout-data";
import { WorkoutDayCard } from "@/components/workout/WorkoutDayCard";
import { WorkoutGuidelines } from "@/components/workout/WorkoutGuidelines";
import { WorkoutLogger } from "@/components/workout/WorkoutLogger";
import { WorkoutScheduleEditor } from "@/components/workout/WorkoutScheduleEditor";

export const dynamic = "force-dynamic";

export default async function WorkoutPage() {
  const workoutPlan =
    await getWorkoutPlan();

  const trainingDays =
    workoutPlan.days.filter(
      (day) => !day.isRestDay,
    );

  const restDays =
    workoutPlan.days.filter(
      (day) => day.isRestDay,
    );

  const totalExercises =
    trainingDays.reduce(
      (total, day) =>
        total + day.exercises.length,
      0,
    );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">
            Training
          </p>

          <h1 className="page-title">
            Workout
          </h1>

          <p className="page-description">
            Follow your workout plan,
            customize your weekly schedule,
            and log your actual performance.
          </p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">
            Training Days
          </span>

          <strong className="metric-value">
            {trainingDays.length}
          </strong>

          <span className="metric-subtitle">
            in workout plan
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">
            Exercises
          </span>

          <strong className="metric-value">
            {totalExercises}
          </strong>

          <span className="metric-subtitle">
            across training days
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">
            Rest Days
          </span>

          <strong className="metric-value">
            {restDays.length}
          </strong>

          <span className="metric-subtitle">
            in workout plan
          </span>
        </div>
      </div>

      <WorkoutScheduleEditor
        workoutDays={workoutPlan.days}
      />

      <WorkoutLogger
        workoutDays={workoutPlan.days}
      />

      <WorkoutGuidelines
        workoutPlan={workoutPlan}
      />

      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              Weekly Plan
            </p>

            <h2 className="section-title">
              Workout Library
            </h2>
          </div>
        </div>

        <div className="stack">
          {workoutPlan.days.map(
            (day) => (
              <WorkoutDayCard
                key={day.day}
                day={day}
              />
            ),
          )}
        </div>
      </section>
    </div>
  );
}