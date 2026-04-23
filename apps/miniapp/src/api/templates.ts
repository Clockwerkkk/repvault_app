import type { WorkoutTemplate } from "../types";
import { apiRequest } from "./client";

export function listTemplates(token: string): Promise<{ items: WorkoutTemplate[] }> {
  return apiRequest("/templates", { token });
}

export function createTemplateFromWorkout(
  token: string,
  workoutId: string,
  title?: string
): Promise<{ id: string; title: string }> {
  return apiRequest(`/templates/from-workout/${workoutId}`, {
    method: "POST",
    token,
    body: title ? { title } : {}
  });
}

export function createTemplate(
  token: string,
  input: { title: string; exerciseIds: string[] }
): Promise<{ id: string; title: string }> {
  return apiRequest("/templates", {
    method: "POST",
    token,
    body: input
  });
}

export function startWorkoutFromTemplate(
  token: string,
  templateId: string
): Promise<{ workoutId: string; status: "created" | "active_exists" }> {
  return apiRequest(`/templates/${templateId}/start`, {
    method: "POST",
    token,
    body: {}
  });
}

export function updateTemplateTitle(
  token: string,
  templateId: string,
  input: { title?: string; exerciseIds?: string[] }
): Promise<{ id: string; title: string }> {
  return apiRequest(`/templates/${templateId}`, {
    method: "PATCH",
    token,
    body: input
  });
}

export function deleteTemplate(token: string, templateId: string): Promise<void> {
  return apiRequest(`/templates/${templateId}`, {
    method: "DELETE",
    token
  });
}
