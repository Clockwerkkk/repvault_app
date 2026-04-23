import { prisma } from "../../common/prisma.js";

export type HomeSummary = {
  lastWorkout: {
    id: string;
    title: string;
    startedAt: string;
    finishedAt: string | null;
    exercisesCount: number;
    setsCount: number;
  } | null;
  stats: {
    totalWorkouts: number;
    totalLoggedExercises: number;
    lastWorkoutDate: string | null;
  };
};

export async function getHomeSummary(userId: string): Promise<HomeSummary> {
  const totalWorkouts = await prisma.workout.count({
    where: {
      userId,
      status: "completed"
    }
  });

  const totalLoggedExercises = await prisma.workoutExercise.count({
    where: {
      workout: {
        userId
      }
    }
  });

  const lastWorkout = await prisma.workout.findFirst({
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

  if (!lastWorkout) {
    return {
      lastWorkout: null,
      stats: {
        totalWorkouts,
        totalLoggedExercises,
        lastWorkoutDate: null
      }
    };
  }

  const exercisesCount = lastWorkout.exercises.length;
  const setsCount = lastWorkout.exercises.reduce((total, exerciseItem) => {
    return total + exerciseItem.sets.length;
  }, 0);

  return {
    lastWorkout: {
      id: lastWorkout.id,
      title: lastWorkout.title,
      startedAt: lastWorkout.startedAt.toISOString(),
      finishedAt: lastWorkout.finishedAt ? lastWorkout.finishedAt.toISOString() : null,
      exercisesCount,
      setsCount
    },
    stats: {
      totalWorkouts,
      totalLoggedExercises,
      lastWorkoutDate: lastWorkout.startedAt.toISOString()
    }
  };
}
