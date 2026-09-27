"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Loader2,
  Save,
} from "lucide-react";

import { WorkoutDay } from "@/types/workout";
import {
  ExerciseLog,
  WorkoutLog,
} from "@/types/workout-log";
import {
  WEEKDAYS,
  WeeklyWorkoutSchedule,
} from "@/types/workout-schedule";

type WorkoutLoggerProps = {
  workoutDays: WorkoutDay[];
};

function getToday() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTodayWeekday() {
  const day = new Date().getDay();

  return WEEKDAYS[
    day === 0 ? 6 : day - 1
  ];
}

function createInitialExercises(
  workoutDay: WorkoutDay,
): ExerciseLog[] {
  return workoutDay.exercises.map(
    (exercise) => ({
      exerciseId: exercise.id,
      completed: false,
      actualSets: null,
      actualReps: null,
      notes: "",
    }),
  );
}

export function WorkoutLogger({
  workoutDays,
}: WorkoutLoggerProps) {
  const today = useMemo(
    () => getToday(),
    [],
  );

  const todayWeekday = useMemo(
    () => getTodayWeekday(),
    [],
  );

  const [
    schedule,
    setSchedule,
  ] = useState<WeeklyWorkoutSchedule | null>(
    null,
  );

  const [
    currentWorkoutDay,
    setCurrentWorkoutDay,
  ] = useState<WorkoutDay | null>(
    null,
  );

  const [
    exercises,
    setExercises,
  ] = useState<ExerciseLog[]>([]);

  const [notes, setNotes] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  /*
   * Load the weekly schedule first.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadSchedule() {
      try {
        const response =
          await fetch(
            "/api/workout-schedule",
            {
              cache: "no-store",
            },
          );

        if (!response.ok) {
          throw new Error(
            "Failed to load workout schedule.",
          );
        }

        const data =
          (await response.json()) as {
            schedule:
              WeeklyWorkoutSchedule;
          };

        if (cancelled) {
          return;
        }

        setSchedule(
          data.schedule,
        );

        const assignedWorkout =
          data.schedule[
            todayWeekday
          ];

        if (
          assignedWorkout === null
        ) {
          setCurrentWorkoutDay(
            null,
          );
          return;
        }

        const workoutDay =
          workoutDays.find(
            (day) =>
              day.day ===
              assignedWorkout,
          ) ?? null;

        setCurrentWorkoutDay(
          workoutDay,
        );
      } catch (error) {
        console.error(
          "Failed to load workout schedule:",
          error,
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSchedule();

    return () => {
      cancelled = true;
    };
  }, [todayWeekday, workoutDays]);

  /*
   * Load today's saved workout
   * after today's assigned workout
   * has been determined.
   */
  useEffect(() => {
    if (
      loading ||
      !currentWorkoutDay
    ) {
      return;
    }

    let cancelled = false;

    async function loadWorkoutLog() {
      setExercises(
        createInitialExercises(
          currentWorkoutDay!,
        ),
      );

      setNotes("");
      setSaved(false);

      try {
        const response =
          await fetch(
            `/api/workout-logs?date=${today}`,
            {
              cache: "no-store",
            },
          );

        if (!response.ok) {
          throw new Error(
            "Failed to load workout log.",
          );
        }

        const data =
          (await response.json()) as {
            workoutLog:
              | WorkoutLog
              | null;
          };

        if (
          cancelled ||
          !data.workoutLog
        ) {
          return;
        }

        const savedLog =
          data.workoutLog;

        /*
         * Only restore the saved log
         * when it belongs to today's
         * assigned workout.
         */
        if (
          savedLog.workoutDay !==
          currentWorkoutDay!.day
        ) {
          return;
        }

        const savedExercises =
          currentWorkoutDay!.exercises.map(
            (exercise) => {
              const existing =
                savedLog.exercises.find(
                  (item) =>
                    item.exerciseId ===
                    exercise.id,
                );

              return (
                existing ?? {
                  exerciseId:
                    exercise.id,
                  completed: false,
                  actualSets: null,
                  actualReps: null,
                  notes: "",
                }
              );
            },
          );

        setExercises(
          savedExercises,
        );

        setNotes(
          savedLog.notes ?? "",
        );

        setSaved(true);
      } catch (error) {
        console.error(
          "Failed to load workout log:",
          error,
        );
      }
    }

    loadWorkoutLog();

    return () => {
      cancelled = true;
    };
  }, [
    loading,
    currentWorkoutDay,
    today,
  ]);

  const completedCount =
    exercises.filter(
      (exercise) =>
        exercise.completed,
    ).length;

  const completionPercentage =
    exercises.length > 0
      ? Math.round(
          (completedCount /
            exercises.length) *
            100,
        )
      : 0;

  function toggleExercise(
    exerciseId: string,
  ) {
    setExercises((current) =>
      current.map((exercise) =>
        exercise.exerciseId ===
        exerciseId
          ? {
              ...exercise,
              completed:
                !exercise.completed,
            }
          : exercise,
      ),
    );

    setSaved(false);
  }

  function updateExercise(
    exerciseId: string,
    field:
      | "actualSets"
      | "actualReps"
      | "notes",
    value: string,
  ) {
    setExercises((current) =>
      current.map((exercise) =>
        exercise.exerciseId ===
        exerciseId
          ? {
              ...exercise,
              [field]:
                field ===
                "actualSets"
                  ? value
                    ? Number(value)
                    : null
                  : value,
            }
          : exercise,
      ),
    );

    setSaved(false);
  }

  async function saveWorkout() {
    if (!currentWorkoutDay) {
      return;
    }

    setSaving(true);
    setSaved(false);

    try {
      const workoutLog: WorkoutLog =
        {
          id: `${today}-day-${currentWorkoutDay.day}`,
          date: today,
          workoutDay:
            currentWorkoutDay.day,
          completed:
            completedCount ===
              exercises.length &&
            exercises.length > 0,
          exercises,
          notes,
        };

      const response =
        await fetch(
          "/api/workout-logs",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              workoutLog,
            ),
          },
        );

      if (!response.ok) {
        throw new Error(
          "Failed to save workout.",
        );
      }

      setSaved(true);
    } catch (error) {
      console.error(
        "Failed to save workout:",
        error,
      );

      window.alert(
        "Could not save the workout. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">
              Today&apos;s Workout
            </p>

            <h2 className="section-title">
              Loading...
            </h2>
          </div>
        </div>

        <div
          style={{
            padding: "2rem",
            display: "flex",
            justifyContent: "center",
            color: "var(--muted)",
          }}
        >
          <Loader2
            size={22}
            className="spin"
          />
        </div>
      </section>
    );
  }

  if (
    schedule &&
    schedule[todayWeekday] === null
  ) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">
              Today&apos;s Schedule
            </p>

            <h2 className="section-title">
              Rest Day
            </h2>
          </div>
        </div>

        <div
          style={{
            padding:
              "1rem 1.25rem 1.25rem",
          }}
        >
          <p className="muted">
            You have scheduled today
            as a rest day. Focus on
            recovery, sleep, hydration
            and mobility.
          </p>
        </div>
      </section>
    );
  }

  if (!currentWorkoutDay) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">
              Today&apos;s Workout
            </p>

            <h2 className="section-title">
              Workout unavailable
            </h2>
          </div>
        </div>

        <div
          style={{
            padding:
              "1rem 1.25rem 1.25rem",
          }}
        >
          <p className="muted">
            The workout assigned to
            today could not be found
            in your workout plan.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">
            Today&apos;s Workout
          </p>

          <h2 className="section-title">
            Day {currentWorkoutDay.day}
          </h2>

          {currentWorkoutDay.title && (
            <p
              className="muted"
              style={{
                margin:
                  "0.25rem 0 0",
                fontSize: "0.8rem",
              }}
            >
              {currentWorkoutDay.title}
            </p>
          )}
        </div>

        <div className="workout-progress">
          <strong>
            {completionPercentage}%
          </strong>

          <span>
            {completedCount}/
            {exercises.length}
          </span>
        </div>
      </div>

      <div className="workout-progress-bar">
        <div
          className="workout-progress-fill"
          style={{
            width: `${completionPercentage}%`,
          }}
        />
      </div>

      <div className="workout-log-list">
        {currentWorkoutDay.exercises.map(
          (exercise, index) => {
            const log =
              exercises[index];

            return (
              <div
                key={exercise.id}
                className={`workout-log-item ${
                  log?.completed
                    ? "completed"
                    : ""
                }`}
              >
                <button
                  type="button"
                  className={`workout-check ${
                    log?.completed
                      ? "checked"
                      : ""
                  }`}
                  onClick={() =>
                    toggleExercise(
                      exercise.id,
                    )
                  }
                  aria-label={
                    log?.completed
                      ? "Mark incomplete"
                      : "Mark complete"
                  }
                >
                  {log?.completed && (
                    <Check size={18} />
                  )}
                </button>

                <div className="workout-log-content">
                  <div className="workout-log-title">
                    <span>
                      {index + 1}.
                    </span>

                    <strong>
                      {exercise.name}
                    </strong>
                  </div>

                  <p className="muted">
                    Planned:{" "}
                    {exercise.sets ??
                      "—"}{" "}
                    sets ×{" "}
                    {exercise.reps ??
                      "—"}{" "}
                    reps
                  </p>

                  <div className="workout-log-inputs">
                    <label>
                      <span>
                        Actual sets
                      </span>

                      <input
                        type="number"
                        min="0"
                        value={
                          log?.actualSets ??
                          ""
                        }
                        onChange={(
                          event,
                        ) =>
                          updateExercise(
                            exercise.id,
                            "actualSets",
                            event.target
                              .value,
                          )
                        }
                      />
                    </label>

                    <label>
                      <span>
                        Actual reps
                      </span>

                      <input
                        type="text"
                        value={
                          log?.actualReps ??
                          ""
                        }
                        onChange={(
                          event,
                        ) =>
                          updateExercise(
                            exercise.id,
                            "actualReps",
                            event.target
                              .value,
                          )
                        }
                        placeholder="e.g. 12"
                      />
                    </label>

                    <label>
                      <span>
                        Notes
                      </span>

                      <input
                        type="text"
                        value={
                          log?.notes ?? ""
                        }
                        onChange={(
                          event,
                        ) =>
                          updateExercise(
                            exercise.id,
                            "notes",
                            event.target
                              .value,
                          )
                        }
                        placeholder="Optional"
                      />
                    </label>
                  </div>
                </div>
              </div>
            );
          },
        )}
      </div>

      <div className="workout-log-footer">
        <label className="workout-notes">
          <span>
            Workout notes
          </span>

          <textarea
            value={notes}
            onChange={(event) => {
              setNotes(
                event.target.value,
              );
              setSaved(false);
            }}
            placeholder="How did the workout feel?"
            rows={3}
          />
        </label>

        <button
          type="button"
          className="primary-button"
          onClick={saveWorkout}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2
                size={18}
                className="spin"
              />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              {saved
                ? "Saved"
                : "Save Workout"}
            </>
          )}
        </button>
      </div>
    </section>
  );
}