export type WorkoutExercise = {
  id: string;
  name: string;
  sets: string | null;
  reps: string | null;
  notes: string[];
  youtubeUrl: string | null;
};

export type WorkoutDay = {
  day: number;
  title: string;
  exercises: WorkoutExercise[];
  warmup: string[];
  stretching: string[];
  dailyTasks: string[];
  isRestDay: boolean;
};

export type WorkoutPlan = {
  days: WorkoutDay[];
};