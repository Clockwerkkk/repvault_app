import { prisma } from "../../common/prisma.js";

type SetInput = {
  weightKg: number | null;
  reps: number;
  setType: "working" | "warmup";
};

export function validateSetInput(input: SetInput): string | null {
  if (input.weightKg !== null && (!Number.isFinite(input.weightKg) || input.weightKg < 0)) {
    return "weightKg must be a number >= 0 when provided";
  }

  if (!Number.isInteger(input.reps) || input.reps <= 0) {
    return "reps must be a positive integer";
  }

  if (!["working", "warmup"].includes(input.setType)) {
    return "setType must be 'working' or 'warmup'";
  }

  return null;
}

export async function createSet(
  userId: string,
  workoutExerciseId: string,
  input: SetInput
) {
  const error = validateSetInput(input);
  if (error) {
    return { status: "validation_error" as const, message: error };
  }

  const workoutExercise = await prisma.workoutExercise.findFirst({
    where: {
      id: workoutExerciseId,
      workout: {
        userId,
        status: "active"
      }
    },
    include: {
      sets: true
    }
  });

  if (!workoutExercise) {
    return { status: "not_found" as const };
  }

  const setIndex = workoutExercise.sets.length + 1;
  const created = await prisma.setEntry.create({
    data: {
      workoutExerciseId,
      setIndex,
      weightKg: input.weightKg,
      reps: input.reps,
      setType: input.setType
    }
  });

  return { status: "created" as const, set: created };
}

export async function updateSet(
  userId: string,
  setId: string,
  input: Partial<SetInput>
) {
  const existing = await prisma.setEntry.findFirst({
    where: {
      id: setId,
      workoutExercise: {
        workout: {
          userId,
          status: "active"
        }
      }
    }
  });

  if (!existing) {
    return { status: "not_found" as const };
  }

  const nextInput: SetInput = {
    weightKg: input.weightKg === undefined ? (existing.weightKg === null ? null : Number(existing.weightKg)) : input.weightKg,
    reps: input.reps ?? existing.reps,
    setType: input.setType ?? existing.setType
  };

  const error = validateSetInput(nextInput);
  if (error) {
    return { status: "validation_error" as const, message: error };
  }

  const updated = await prisma.setEntry.update({
    where: { id: setId },
    data: {
      weightKg: nextInput.weightKg,
      reps: nextInput.reps,
      setType: nextInput.setType
    }
  });

  return { status: "updated" as const, set: updated };
}

export async function deleteSet(userId: string, setId: string) {
  const existing = await prisma.setEntry.findFirst({
    where: {
      id: setId,
      workoutExercise: {
        workout: {
          userId,
          status: "active"
        }
      }
    }
  });

  if (!existing) {
    return { status: "not_found" as const };
  }

  await prisma.$transaction(async (tx) => {
    await tx.setEntry.delete({ where: { id: setId } });

    const remaining = await tx.setEntry.findMany({
      where: { workoutExerciseId: existing.workoutExerciseId },
      orderBy: { setIndex: "asc" }
    });

    for (let index = 0; index < remaining.length; index += 1) {
      const targetSet = remaining[index];
      const newIndex = index + 1;
      if (targetSet.setIndex !== newIndex) {
        await tx.setEntry.update({
          where: { id: targetSet.id },
          data: { setIndex: newIndex }
        });
      }
    }
  });

  return { status: "deleted" as const };
}
