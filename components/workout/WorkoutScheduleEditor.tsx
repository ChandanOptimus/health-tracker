"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Loader2,
  Save,
} from "lucide-react";

import {
  WEEKDAYS,
  WEEKDAY_LABELS,
  WeeklyWorkoutSchedule,
} from "@/types/workout-schedule";

import { WorkoutDay } from "@/types/workout";

type WorkoutScheduleEditorProps = {
  workoutDays: WorkoutDay[];
};

const DEFAULT_SCHEDULE:
  WeeklyWorkoutSchedule = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: null,
};

export function WorkoutScheduleEditor({
  workoutDays,
}: WorkoutScheduleEditorProps) {
  const [
    schedule,
    setSchedule,
  ] = useState<WeeklyWorkoutSchedule>(
    DEFAULT_SCHEDULE,
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

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

        if (!cancelled) {
          setSchedule(
            data.schedule,
          );
        }
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
  }, []);

  function updateDay(
    weekday:
      (typeof WEEKDAYS)[number],
    value: string,
  ) {
    setSchedule((current) => ({
      ...current,
      [weekday]:
        value === "rest"
          ? null
          : Number(value),
    }));

    setSaved(false);
  }

  async function saveSchedule() {
    setSaving(true);
    setSaved(false);

    try {
      const response =
        await fetch(
          "/api/workout-schedule",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              schedule,
            }),
          },
        );

      if (!response.ok) {
        throw new Error(
          "Failed to save workout schedule.",
        );
      }

      setSaved(true);
    } catch (error) {
      console.error(
        "Failed to save workout schedule:",
        error,
      );

      window.alert(
        "Could not save the workout schedule. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="workout-schedule-panel">
      <div className="workout-schedule-header">
        <div className="workout-schedule-heading">
          <div className="workout-guideline-icon">
            <CalendarDays size={20} />
          </div>

          <div>
            <p className="eyebrow">
              Your Routine
            </p>

            <h2 className="section-title">
              Weekly Workout Schedule
            </h2>
          </div>
        </div>

        <p className="muted workout-schedule-description">
          Choose which workout you want
          to perform on each day. You can
          also assign any day as rest.
        </p>
      </div>

      {loading ? (
        <div className="workout-schedule-loading">
          <Loader2
            size={22}
            className="spin"
          />

          <span>
            Loading schedule...
          </span>
        </div>
      ) : (
        <>
          <div className="workout-schedule-grid">
            {WEEKDAYS.map(
              (weekday) => {
                const selected =
                  schedule[
                    weekday
                  ];

                return (
                  <label
                    key={weekday}
                    className="workout-schedule-day"
                  >
                    <span className="workout-schedule-day-name">
                      {
                        WEEKDAY_LABELS[
                          weekday
                        ]
                      }
                    </span>

                    <select
                      value={
                        selected ===
                        null
                          ? "rest"
                          : String(
                              selected,
                            )
                      }
                      onChange={(
                        event,
                      ) =>
                        updateDay(
                          weekday,
                          event.target
                            .value,
                        )
                      }
                    >
                      <option value="rest">
                        Rest Day
                      </option>

                      {workoutDays.map(
                        (day) => (
                          <option
                            key={
                              day.day
                            }
                            value={String(
                              day.day,
                            )}
                          >
                            Day{" "}
                            {day.day}
                            {day.title
                              ? ` — ${day.title}`
                              : ""}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                );
              },
            )}
          </div>

          <div className="workout-schedule-footer">
            <span
              className={
                saved
                  ? "workout-schedule-saved"
                  : "muted"
              }
            >
              {saved
                ? "Schedule saved"
                : "Changes are not saved yet"}
            </span>

            <button
              type="button"
              className="primary-button"
              onClick={saveSchedule}
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

                  Save Schedule
                </>
              )}
            </button>
          </div>
        </>
      )}
    </section>
  );
}