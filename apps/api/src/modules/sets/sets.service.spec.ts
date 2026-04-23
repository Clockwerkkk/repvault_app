import { describe, expect, it } from "vitest";
import { validateSetInput } from "./sets.service.js";

describe("sets service validation", () => {
  it("accepts valid set input", () => {
    const result = validateSetInput({
      weightKg: 100,
      reps: 5,
      setType: "working"
    });

    expect(result).toBeNull();
  });

  it("rejects negative weight", () => {
    const result = validateSetInput({
      weightKg: -1,
      reps: 5,
      setType: "working"
    });

    expect(result).toContain("weightKg");
  });

  it("rejects non integer reps", () => {
    const result = validateSetInput({
      weightKg: 80,
      reps: 5.5,
      setType: "warmup"
    });

    expect(result).toContain("reps");
  });
});
