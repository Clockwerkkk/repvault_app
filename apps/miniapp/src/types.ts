import type {
  ExerciseListItemDto,
  HomeSummaryDto,
  SetType,
  WorkoutStatus
} from "@fitness-app/shared";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
};

export type AuthState = {
  token: string;
  user: AuthUser;
};

export type HomeSummary = HomeSummaryDto;
export type ExerciseListItem = ExerciseListItemDto;

export type ActiveWorkout = {
  id: string;
  title: string;
  status: WorkoutStatus;
  startedAt: string;
  finishedAt: string | null;
  exercises: Array<{
    id: string;
    orderIndex: number;
    exercise: {
      id: string;
      name: string;
      category: {
        id: string;
        slug: string;
        name: string;
      };
    };
    setsCount: number;
    sets: Array<{
      id: string;
      setIndex: number;
      weightKg: number;
      reps: number;
      setType: SetType;
    }>;
  }>;
};

export type WorkoutHistoryItem = {
  id: string;
  title: string;
  startedAt: string;
  finishedAt: string | null;
  exercisesCount: number;
  setsCount: number;
  totalVolume: number;
};

export type WorkoutDetails = {
  id: string;
  title: string;
  status: WorkoutStatus;
  startedAt: string;
  finishedAt: string | null;
  totalVolume: number;
  exercises: Array<{
    id: string;
    orderIndex: number;
    exercise: {
      id: string;
      name: string;
      category: {
        id: string;
        slug: string;
        name: string;
      };
    };
    sets: Array<{
      id: string;
      setIndex: number;
      weightKg: number;
      reps: number;
      setType: SetType;
    }>;
  }>;
};

export type ExerciseProgress = {
  exercise: {
    id: string;
    name: string;
    category: {
      id: string;
      slug: string;
      name: string;
    };
  };
  metrics: {
    bestWeight: number;
    bestEstimatedOneRepMax: number;
    totalVolume: number;
    sessionsCount: number;
  };
  history: Array<{
    workoutId: string;
    date: string;
    bestWeight: number;
    bestEstimatedOneRepMax: number;
    volume: number;
  }>;
};
