import { prisma } from "../../common/prisma.js";

export function normalizeWorkoutTitle(title?: string): string {
  const normalized = title?.trim();
  return normalized ? normalized : "Workout";
}

export async function createWorkout(userId: string, title?: string) {
  const existingActiveWorkout = await prisma.workout.findFirst({
    where: {
      userId,
      status: "active"
    }
  });

  if (existingActiveWorkout) {
    return existingActiveWorkout;
  }

  return prisma.workout.create({
    data: {
      userId,
      title: normalizeWorkoutTitle(title),
      status: "active"
    }
  });
}

export async function getActiveWorkout(userId: string) {
  return prisma.workout.findFirst({
    where: {
      userId,
      status: "active"
    },
    include: {
      exercises: {
        orderBy: {
          orderIndex: "asc"
        },
        include: {
          exercise: {
            include: {
              category: true
            }
          },
          sets: {
            orderBy: {
              setIndex: "asc"
            }
          }
        }
      }
    }
  });
}

export async function finishWorkout(userId: string, workoutId: string) {
  const workout = await prisma.workout.findFirst({
    where: {
      id: workoutId,
      userId
    }
  });

  if (!workout) {
    return null;
  }

  if (workout.status === "completed") {
    return workout;
  }

  return prisma.workout.update({
    where: {
      id: workout.id
    },
    data: {
      status: "completed",
      finishedAt: new Date()
    }
  });
}

export async function addExerciseToWorkout(
  userId: string,
  workoutId: string,
  exerciseId: string
) {
  const workout = await prisma.workout.findFirst({
    where: {
      id: workoutId,
      userId,
      status: "active"
    },
    include: {
      exercises: true
    }
  });

  if (!workout) {
    return { status: "workout_not_found" as const };
  }

  const exercise = await prisma.exercise.findFirst({
    where: {
      id: exerciseId,
      isActive: true
    }
  });

  if (!exercise) {
    return { status: "exercise_not_found" as const };
  }

  const existingLink = workout.exercises.find((item) => item.exerciseId === exerciseId);
  if (existingLink) {
    return { status: "duplicate" as const, workoutExerciseId: existingLink.id };
  }

  const orderIndex = workout.exercises.length + 1;

  const workoutExercise = await prisma.workoutExercise.create({
    data: {
      workoutId: workout.id,
      exerciseId,
      orderIndex
    },
    include: {
      exercise: {
        include: {
          category: true
        }
      }
    }
  });

  return { status: "created" as const, workoutExercise };
}

export async function getWorkoutHistory(userId: string) {
  const workouts = await prisma.workout.findMany({
    where: {
      userId,
      status: "completed"
    },
    orderBy: {
      startedAt: "desc"
    },
    include: {
      exercises: {
        include: {
          sets: true
        }
      }
    }
  });

  return workouts.map((workout) => {
    const exercisesCount = workout.exercises.length;
    const setsCount = workout.exercises.reduce((acc, item) => acc + item.sets.length, 0);
    const totalVolume = workout.exercises.reduce((acc, item) => {
      const exerciseVolume = item.sets.reduce((sum, set) => {
        return sum + Number(set.weightKg) * set.reps;
      }, 0);
      return acc + exerciseVolume;
    }, 0);

    return {
      id: workout.id,
      title: workout.title,
      startedAt: workout.startedAt,
      finishedAt: workout.finishedAt,
      exercisesCount,
      setsCount,
      totalVolume
    };
  });
}

export async function getWorkoutDetails(userId: string, workoutId: string) {
  const workout = await prisma.workout.findFirst({
    where: {
      id: workoutId,
      userId,
      status: "completed"
    },
    include: {
      exercises: {
        orderBy: {
          orderIndex: "asc"
        },
        include: {
          exercise: {
            include: {
              category: true
            }
          },
          sets: {
            orderBy: {
              setIndex: "asc"
            }
          }
        }
      }
    }
  });

  if (!workout) {
    return null;
  }

  const totalVolume = workout.exercises.reduce((acc, item) => {
    const exerciseVolume = item.sets.reduce((sum, set) => {
      return sum + Number(set.weightKg) * set.reps;
    }, 0);
    return acc + exerciseVolume;
  }, 0);

  return {
    ...workout,
    totalVolume
  };
}
