export type SetType = "working" | "warmup";

export type WorkoutLifecycleStatus = "active" | "completed";

export type HomeSummaryDto = {
  lastWorkout: {
    id: string;
    title: string;
    startedAt: string;
    finishedAt: string | null;
    exercisesCount: number;
    setsCount: number;
  } | null;
  stats: {
    totalWorkouts: number;
    totalLoggedExercises: number;
    lastWorkoutDate: string | null;
  };
};

export type ExerciseCategoryDto = {
  id: string;
  slug: string;
  name: string;
};

export type ExerciseListItemDto = {
  id: string;
  name: string;
  equipmentType: string | null;
  category: ExerciseCategoryDto;
};
