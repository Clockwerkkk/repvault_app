export type CreateSetBody = {
  weightKg?: number | null;
  reps: number;
  setType?: "working" | "warmup";
};

export type UpdateSetBody = {
  weightKg?: number | null;
  reps?: number;
  setType?: "working" | "warmup";
};
