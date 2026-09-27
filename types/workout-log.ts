export type ExerciseLog = {
  exerciseId: string;
  completed: boolean;
  actualSets: number | null;
  actualReps: string | null;
  notes: string;
};

export type WorkoutLog = {
  id: string;
  date: string;
  workoutDay: number;
  completed: boolean;
  exercises: ExerciseLog[];
  notes: string;
};

export type WorkoutLogSummary = {
  totalPlanned: number;
  totalCompleted: number;
  completionPercentage: number;
  currentStreak: number;
};