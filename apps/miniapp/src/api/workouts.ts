import type { ActiveWorkout, WorkoutDetails, WorkoutHistoryItem } from "../types";
import { apiRequest } from "./client";

type ActiveWorkoutResponse = { workout: ActiveWorkout | null };

export function createWorkout(token: string): Promise<{
  id: string;
  title: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
}> {
  return apiRequest("/workouts", {
    method: "POST",
    token,
    body: {}
  });
}

export async function getActiveWorkout(token: string): Promise<ActiveWorkout | null> {
  const result = await apiRequest<ActiveWorkoutResponse>("/workouts/active", { token });
  return result.workout;
}

export function addExerciseToWorkout(
  token: string,
  workoutId: string,
  exerciseId: string
): Promise<{
  id: string;
  orderIndex: number;
}> {
  return apiRequest(`/workouts/${workoutId}/exercises`, {
    method: "POST",
    token,
    body: { exerciseId }
  });
}

export function finishWorkout(token: string, workoutId: string): Promise<{
  id: string;
  status: string;
  finishedAt: string | null;
}> {
  return apiRequest(`/workouts/${workoutId}/finish`, {
    method: "POST",
    token,
    body: {}
  });
}

export function getWorkoutHistory(token: string): Promise<{ items: WorkoutHistoryItem[] }> {
  return apiRequest("/workouts/history", { token });
}

export function getWorkoutDetails(token: string, workoutId: string): Promise<WorkoutDetails> {
  return apiRequest(`/workouts/${workoutId}`, { token });
}
