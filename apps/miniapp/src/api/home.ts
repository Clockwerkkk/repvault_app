import type { HomeSummary } from "../types";
import { apiRequest } from "./client";

export function getHomeSummary(token: string): Promise<HomeSummary> {
  return apiRequest<HomeSummary>("/home/summary", { token });
}
