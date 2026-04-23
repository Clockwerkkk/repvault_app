import type { AuthState } from "../types";

const STORAGE_KEY = "gymlog-auth-state";
const APP_SESSION_STORAGE_KEY = "gymlog-app-session";

export type AppSessionState = {
  screen: string;
  selectedWorkoutExerciseId: string | null;
  selectedWorkoutId: string | null;
  pickerSearchValue: string;
  pickerGroupId: string;
  catalogSearchValue: string;
};

export function loadAuthState(): AuthState | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

export function saveAuthState(state: AuthState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearAuthState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function loadAppSessionState(): AppSessionState | null {
  const raw = localStorage.getItem(APP_SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AppSessionState;
  } catch {
    return null;
  }
}

export function saveAppSessionState(state: AppSessionState): void {
  localStorage.setItem(APP_SESSION_STORAGE_KEY, JSON.stringify(state));
}

export function clearAppSessionState(): void {
  localStorage.removeItem(APP_SESSION_STORAGE_KEY);
}
