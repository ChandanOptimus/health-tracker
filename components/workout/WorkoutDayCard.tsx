
import {
  CheckCircle2,
  Clock3,
  Dumbbell,
  ExternalLink,
} from "lucide-react";

import {
  WorkoutDay,
} from "@/types/workout";

export function WorkoutDayCard({
  day,
}: {
  day: WorkoutDay;
}) {
  if (day.isRestDay) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[.02] p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5">
            <Clock3 size={18} />
          </div>

          <div>
            <div className="text-xs muted">
              Day {day.day}
            </div>

            <h3 className="mt-1 font-semibold">
              Rest Day
            </h3>
          </div>
        </div>

        <p className="mt-5 text-sm leading-6 text-white/60">
          Recovery day. Focus on rest,
          hydration and recovery.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[.02] p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5">
            <Dumbbell size={18} />
          </div>

          <div>
            <div className="text-xs muted">
              Day {day.day}
            </div>

            <h3 className="mt-1 font-semibold">
              Training
            </h3>
          </div>
        </div>

        <span className="rounded-full border border-white/10 px-3 py-1 text-xs muted">
          {day.exercises.length} exercises
        </span>
      </div>

      <div className="mt-5 space-y-2">
        {day.exercises.map(
          (exercise, index) => (
            <div
              key={exercise.id}
              className="rounded-xl border border-white/5 bg-white/[.02] p-4"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/5 text-xs muted">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-medium">
                    {exercise.name}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {exercise.sets && (
                      <span className="rounded-md bg-white/5 px-2 py-1 text-xs muted">
                        {exercise.sets} sets
                      </span>
                    )}

                    {exercise.reps && (
                      <span className="rounded-md bg-white/5 px-2 py-1 text-xs muted">
                        {exercise.reps} reps
                      </span>
                    )}
                  </div>

                  {exercise.youtubeUrl && (
                    <a
                      href={
                        exercise.youtubeUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/60 transition hover:text-white"
                    >
                      Exercise reference
                      <ExternalLink
                        size={12}
                      />
                    </a>
                  )}
                </div>

                <CheckCircle2
                  size={18}
                  className="shrink-0 text-white/20"
                />
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}