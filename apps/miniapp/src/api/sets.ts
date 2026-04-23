import { apiRequest } from "./client";

export function createSet(
  token: string,
  workoutExerciseId: string,
  body: { weightKg: number; reps: number; setType: "working" | "warmup" }
): Promise<{
  id: string;
}> {
  return apiRequest(`/workout-exercises/${workoutExerciseId}/sets`, {
    method: "POST",
    token,
    body
  });
}

export function updateSet(
  token: string,
  setId: string,
  body: { weightKg?: number; reps?: number; setType?: "working" | "warmup" }
): Promise<{ id: string }> {
  return apiRequest(`/sets/${setId}`, {
    method: "PATCH",
    token,
    body
  });
}

export function deleteSet(token: string, setId: string): Promise<void> {
  return apiRequest(`/sets/${setId}`, {
    method: "DELETE",
    token
  });
}
