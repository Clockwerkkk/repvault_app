import type { ExerciseListItem, ExerciseProgress } from "../types";
import { apiRequest } from "./client";

type ExercisesResponse = {
  total: number;
  limit: number;
  offset: number;
  items: ExerciseListItem[];
};

export function listExercises(
  token: string,
  params: { search?: string; category?: string; limit?: number; offset?: number } = {}
): Promise<ExercisesResponse> {
  const query = new URLSearchParams();
  if (params.search) {
    query.set("search", params.search);
  }
  if (params.category) {
    query.set("category", params.category);
  }
  if (params.limit !== undefined) {
    query.set("limit", String(params.limit));
  }
  if (params.offset !== undefined) {
    query.set("offset", String(params.offset));
  }

  return apiRequest(`/exercises?${query.toString()}`, { token });
}

export function getExerciseProgress(token: string, exerciseId: string): Promise<ExerciseProgress> {
  return apiRequest(`/exercises/${exerciseId}/progress`, { token });
}
