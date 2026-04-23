export type CreateSetBody = {
  weightKg: number;
  reps: number;
  setType?: "working" | "warmup";
};

export type UpdateSetBody = {
  weightKg?: number;
  reps?: number;
  setType?: "working" | "warmup";
};
