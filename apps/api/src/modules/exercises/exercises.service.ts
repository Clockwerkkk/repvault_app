import { prisma } from "../../common/prisma.js";

type ListExercisesInput = {
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
};

export async function listExercises(input: ListExercisesInput) {
  const searchValue = input.search?.trim();
  const categoryValue = input.category?.trim();
  const limit = Math.min(Math.max(input.limit ?? 30, 1), 100);
  const offset = Math.max(input.offset ?? 0, 0);

  const whereClause = {
    isActive: true,
    ...(searchValue
      ? {
          name: {
            contains: searchValue,
            mode: "insensitive" as const
          }
        }
      : {}),
    ...(categoryValue
      ? {
          category: {
            OR: [
              { slug: categoryValue.toLowerCase() },
              { name: { equals: categoryValue, mode: "insensitive" as const } }
            ]
          }
        }
      : {})
  };

  const [items, total] = await Promise.all([
    prisma.exercise.findMany({
      where: whereClause,
      include: {
        category: true
      },
      orderBy: [{ name: "asc" }],
      skip: offset,
      take: limit
    }),
    prisma.exercise.count({
      where: whereClause
    })
  ]);

  return {
    items,
    total,
    limit,
    offset
  };
}

function calculateEstimatedOneRepMax(weightKg: number, reps: number): number {
  return weightKg * (1 + reps / 30);
}

export async function getExerciseProgress(userId: string, exerciseId: string) {
  const exercise = await prisma.exercise.findFirst({
    where: {
      id: exerciseId,
      isActive: true
    },
    include: {
      category: true
    }
  });

  if (!exercise) {
    return null;
  }

  const completedWorkoutItems = await prisma.workoutExercise.findMany({
    where: {
      exerciseId,
      workout: {
        userId,
        status: "completed"
      }
    },
    include: {
      workout: true,
      sets: true
    },
    orderBy: {
      workout: {
        startedAt: "asc"
      }
    }
  });

  let bestWeight = 0;
  let bestEstimatedOneRepMax = 0;
  let totalVolume = 0;

  const history = completedWorkoutItems.map((item) => {
    let sessionBestWeight = 0;
    let sessionBestEstimatedOneRepMax = 0;
    let sessionVolume = 0;

    for (const set of item.sets) {
      const weight = Number(set.weightKg);
      const e1rm = calculateEstimatedOneRepMax(weight, set.reps);
      const volume = weight * set.reps;

      sessionBestWeight = Math.max(sessionBestWeight, weight);
      sessionBestEstimatedOneRepMax = Math.max(sessionBestEstimatedOneRepMax, e1rm);
      sessionVolume += volume;

      bestWeight = Math.max(bestWeight, weight);
      bestEstimatedOneRepMax = Math.max(bestEstimatedOneRepMax, e1rm);
      totalVolume += volume;
    }

    return {
      workoutId: item.workoutId,
      date: item.workout.startedAt,
      bestWeight: sessionBestWeight,
      bestEstimatedOneRepMax: sessionBestEstimatedOneRepMax,
      volume: sessionVolume
    };
  });

  return {
    exercise: {
      id: exercise.id,
      name: exercise.name,
      category: {
        id: exercise.category.id,
        slug: exercise.category.slug,
        name: exercise.category.name
      }
    },
    metrics: {
      bestWeight,
      bestEstimatedOneRepMax,
      totalVolume,
      sessionsCount: completedWorkoutItems.length
    },
    history
  };
}
