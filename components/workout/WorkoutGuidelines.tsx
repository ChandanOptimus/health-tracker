import {
  CheckCircle2,
  Dumbbell,
  ListChecks,
  RefreshCw,
} from "lucide-react";

import { WorkoutPlan } from "@/types/workout";

type WorkoutGuidelinesProps = {
  workoutPlan: WorkoutPlan;
};

type GuidelinePanelProps = {
  title: string;
  items?: string[];
  icon: React.ReactNode;
};

function GuidelinePanel({
  title,
  items = [],
  icon,
}: GuidelinePanelProps) {
  return (
    <div className="workout-guideline-panel">
      <div className="workout-guideline-header">
        <div className="workout-guideline-icon">
          {icon}
        </div>

        <div>
          <p className="eyebrow">Guidelines</p>

          <h3 className="workout-guideline-title">
            {title}
          </h3>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="muted workout-guideline-empty">
          No information available.
        </p>
      ) : (
        <ul className="workout-guideline-list">
          {items.map((item, index) => (
            <li
              key={`${title}-${index}`}
              className="workout-guideline-item"
            >
              <CheckCircle2 size={16} />

              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function WorkoutGuidelines({
  workoutPlan,
}: WorkoutGuidelinesProps) {
  const warmup = [
    ...new Set(
      workoutPlan.days.flatMap(
        (day) => day.warmup ?? [],
      ),
    ),
  ];

  const stretching = [
    ...new Set(
      workoutPlan.days.flatMap(
        (day) => day.stretching ?? [],
      ),
    ),
  ];

  const dailyTasks = [
    ...new Set(
      workoutPlan.days.flatMap(
        (day) => day.dailyTasks ?? [],
      ),
    ),
  ];

  return (
    <section className="workout-guidelines-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            Supporting Routine
          </p>

          <h2 className="section-title">
            Workout Guidelines
          </h2>
        </div>
      </div>

      <div className="workout-guidelines-grid">
        <GuidelinePanel
          title="Warm-up"
          items={warmup}
          icon={<Dumbbell size={20} />}
        />

        <GuidelinePanel
          title="Stretching"
          items={stretching}
          icon={<RefreshCw size={20} />}
        />

        <GuidelinePanel
          title="Daily Tasks"
          items={dailyTasks}
          icon={<ListChecks size={20} />}
        />
      </div>
    </section>
  );
}