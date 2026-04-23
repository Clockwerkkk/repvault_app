import { describe, expect, it } from "vitest";
import { normalizeWorkoutTitle } from "./workouts.service.js";

describe("workouts service helpers", () => {
  it("returns default title for empty values", () => {
    expect(normalizeWorkoutTitle()).toBe("Workout");
    expect(normalizeWorkoutTitle("")).toBe("Workout");
    expect(normalizeWorkoutTitle("   ")).toBe("Workout");
  });

  it("trims custom title", () => {
    expect(normalizeWorkoutTitle("  Push Day  ")).toBe("Push Day");
  });
});
