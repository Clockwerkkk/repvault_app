import { prisma } from "../../common/prisma.js";
import { normalizeWorkoutTitle } from "../workouts/workouts.service.js";

async function ensureExercisesExist(exerciseIds: string[]): Promise<boolean> {
  if (exerciseIds.length === 0) {
    return true;
  }

  const count = await prisma.exercise.count({
    where: {
      id: { in: exerciseIds },
      isActive: true
    }
  });

  return count === exerciseIds.length;
}

export async function listWorkoutTemplates(userId: string) {
  return prisma.workoutTemplate.findMany({
    where: { userId },
    orderBy: [{ updatedAt: "desc" }],
    include: {
      exercises: {
        orderBy: { orderIndex: "asc" },
        include: {
          exercise: {
            include: { category: true }
          }
        }
      }
    }
  });
}

export async function createTemplateFromWorkout(userId: string, workoutId: string, title?: string) {
  const workout = await prisma.workout.findFirst({
    where: {
      id: workoutId,
      userId
    },
    include: {
      exercises: {
        orderBy: { orderIndex: "asc" }
      }
    }
  });

  if (!workout) {
    return { status: "workout_not_found" as const };
  }

  if (workout.exercises.length === 0) {
    return { status: "empty_workout" as const };
  }

  const template = await prisma.workoutTemplate.create({
    data: {
      userId,
      title: normalizeWorkoutTitle(title ?? workout.title),
      exercises: {
        create: workout.exercises.map((item) => ({
          exerciseId: item.exerciseId,
          orderIndex: item.orderIndex
        }))
      }
    },
    include: {
      exercises: {
        orderBy: { orderIndex: "asc" },
        include: {
          exercise: {
            include: { category: true }
          }
        }
      }
    }
  });

  return { status: "created" as const, template };
}

export async function createTemplate(
  userId: string,
  input: { title?: string; exerciseIds: string[] }
) {
  const exerciseIds = Array.from(new Set(input.exerciseIds));
  if (exerciseIds.length === 0) {
    return { status: "empty_exercises" as const };
  }

  const hasAllExercises = await ensureExercisesExist(exerciseIds);
  if (!hasAllExercises) {
    return { status: "exercise_not_found" as const };
  }

  const template = await prisma.workoutTemplate.create({
    data: {
      userId,
      title: normalizeWorkoutTitle(input.title),
      exercises: {
        create: exerciseIds.map((exerciseId, index) => ({
          exerciseId,
          orderIndex: index + 1
        }))
      }
    }
  });

  return { status: "created" as const, template };
}

export async function startWorkoutFromTemplate(userId: string, templateId: string) {
  const activeWorkout = await prisma.workout.findFirst({
    where: { userId, status: "active" }
  });

  if (activeWorkout) {
    return { status: "active_exists" as const, workoutId: activeWorkout.id };
  }

  const template = await prisma.workoutTemplate.findFirst({
    where: {
      id: templateId,
      userId
    },
    include: {
      exercises: {
        orderBy: { orderIndex: "asc" }
      }
    }
  });

  if (!template) {
    return { status: "template_not_found" as const };
  }

  const workout = await prisma.workout.create({
    data: {
      userId,
      title: normalizeWorkoutTitle(template.title),
      status: "active",
      exercises: {
        create: template.exercises.map((item) => ({
          exerciseId: item.exerciseId,
          orderIndex: item.orderIndex
        }))
      }
    }
  });

  return { status: "created" as const, workoutId: workout.id };
}

export async function updateTemplate(
  userId: string,
  templateId: string,
  input: { title?: string; exerciseIds?: string[] }
) {
  const template = await prisma.workoutTemplate.findFirst({
    where: {
      id: templateId,
      userId
    }
  });

  if (!template) {
    return null;
  }

  const hasExerciseUpdate = input.exerciseIds !== undefined;
  const dedupedExerciseIds = hasExerciseUpdate
    ? Array.from(new Set(input.exerciseIds ?? []))
    : undefined;

  if (hasExerciseUpdate && (dedupedExerciseIds?.length ?? 0) === 0) {
    return { status: "empty_exercises" as const };
  }

  if (hasExerciseUpdate) {
    const hasAllExercises = await ensureExercisesExist(dedupedExerciseIds ?? []);
    if (!hasAllExercises) {
      return { status: "exercise_not_found" as const };
    }
  }

  const updated = await prisma.workoutTemplate.update({
    where: {
      id: template.id
    },
    data: {
      title: input.title === undefined ? undefined : normalizeWorkoutTitle(input.title),
      ...(hasExerciseUpdate
        ? {
            exercises: {
              deleteMany: {},
              create: (dedupedExerciseIds ?? []).map((exerciseId, index) => ({
                exerciseId,
                orderIndex: index + 1
              }))
            }
          }
        : {})
    }
  });

  return { status: "updated" as const, template: updated };
}

export async function deleteTemplate(userId: string, templateId: string) {
  const template = await prisma.workoutTemplate.findFirst({
    where: {
      id: templateId,
      userId
    }
  });

  if (!template) {
    return null;
  }

  await prisma.workoutTemplate.delete({
    where: {
      id: template.id
    }
  });

  return { id: template.id };
}
