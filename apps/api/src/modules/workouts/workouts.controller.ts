import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../common/auth-middleware.js";
import type {
  AddWorkoutExerciseBody,
  CreateWorkoutBody,
  UpdateWorkoutBody
} from "./dto/workouts.dto.js";
import {
  addExerciseToWorkout,
  createWorkout,
  deleteWorkout,
  deleteWorkoutExercise,
  finishWorkout,
  getActiveWorkout,
  getWorkoutDetails,
  getWorkoutHistory,
  updateWorkoutTitle
} from "./workouts.service.js";

function mapWorkoutResponse(workout: Awaited<ReturnType<typeof getActiveWorkout>>) {
  if (!workout) {
    return null;
  }

  return {
    id: workout.id,
    title: workout.title,
    status: workout.status,
    startedAt: workout.startedAt.toISOString(),
    finishedAt: workout.finishedAt ? workout.finishedAt.toISOString() : null,
    exercises: workout.exercises.map((item) => ({
      id: item.id,
      orderIndex: item.orderIndex,
      exercise: {
        id: item.exercise.id,
        name: item.exercise.name,
        category: {
          id: item.exercise.category.id,
          slug: item.exercise.category.slug,
          name: item.exercise.category.name
        }
      },
      setsCount: item.sets.length,
      sets: item.sets.map((set) => ({
        id: set.id,
        setIndex: set.setIndex,
        weightKg: set.weightKg === null ? null : Number(set.weightKg),
        reps: set.reps,
        setType: set.setType
      }))
    }))
  };
}

export async function registerWorkoutsController(server: FastifyInstance): Promise<void> {
  server.post<{ Body: CreateWorkoutBody }>(
    "/workouts",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.authUserId) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const workout = await createWorkout(request.authUserId, request.body?.title);
      return reply.send({
        id: workout.id,
        title: workout.title,
        status: workout.status,
        startedAt: workout.startedAt.toISOString(),
        finishedAt: workout.finishedAt ? workout.finishedAt.toISOString() : null
      });
    }
  );

  server.get("/workouts/active", { preHandler: requireAuth }, async (request, reply) => {
    if (!request.authUserId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const workout = await getActiveWorkout(request.authUserId);
    return reply.send({ workout: mapWorkoutResponse(workout) });
  });

  server.post<{ Params: { id: string } }>(
    "/workouts/:id/finish",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.authUserId) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const finishedWorkout = await finishWorkout(request.authUserId, request.params.id);
      if (!finishedWorkout) {
        return reply.code(404).send({ message: "Workout not found" });
      }

      return reply.send({
        id: finishedWorkout.id,
        status: finishedWorkout.status,
        finishedAt: finishedWorkout.finishedAt
          ? finishedWorkout.finishedAt.toISOString()
          : null
      });
    }
  );

  server.post<{ Params: { id: string }; Body: AddWorkoutExerciseBody }>(
    "/workouts/:id/exercises",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.authUserId) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const exerciseId = request.body?.exerciseId;
      if (!exerciseId) {
        return reply.code(400).send({ message: "exerciseId is required" });
      }

      const result = await addExerciseToWorkout(request.authUserId, request.params.id, exerciseId);

      if (result.status === "workout_not_found") {
        return reply.code(404).send({ message: "Active workout not found" });
      }

      if (result.status === "exercise_not_found") {
        return reply.code(404).send({ message: "Exercise not found" });
      }

      if (result.status === "duplicate") {
        return reply.code(409).send({
          message: "Exercise already added to workout",
          workoutExerciseId: result.workoutExerciseId
        });
      }

      return reply.code(201).send({
        id: result.workoutExercise.id,
        orderIndex: result.workoutExercise.orderIndex,
        exercise: {
          id: result.workoutExercise.exercise.id,
          name: result.workoutExercise.exercise.name,
          category: {
            id: result.workoutExercise.exercise.category.id,
            slug: result.workoutExercise.exercise.category.slug,
            name: result.workoutExercise.exercise.category.name
          }
        }
      });
    }
  );

  server.patch<{ Params: { id: string }; Body: UpdateWorkoutBody }>(
    "/workouts/:id",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.authUserId) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const workout = await updateWorkoutTitle(request.authUserId, request.params.id, request.body?.title);
      if (!workout) {
        return reply.code(404).send({ message: "Workout not found" });
      }

      return reply.send({
        id: workout.id,
        title: workout.title,
        status: workout.status
      });
    }
  );

  server.delete<{ Params: { id: string } }>(
    "/workouts/:id",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.authUserId) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const result = await deleteWorkout(request.authUserId, request.params.id);
      if (!result) {
        return reply.code(404).send({ message: "Workout not found" });
      }

      return reply.code(204).send();
    }
  );

  server.delete<{ Params: { id: string; workoutExerciseId: string } }>(
    "/workouts/:id/exercises/:workoutExerciseId",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.authUserId) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const result = await deleteWorkoutExercise(
        request.authUserId,
        request.params.id,
        request.params.workoutExerciseId
      );

      if (result.status === "workout_not_found") {
        return reply.code(404).send({ message: "Active workout not found" });
      }

      if (result.status === "workout_exercise_not_found") {
        return reply.code(404).send({ message: "Workout exercise not found" });
      }

      return reply.code(204).send();
    }
  );

  server.get("/workouts/history", { preHandler: requireAuth }, async (request, reply) => {
    if (!request.authUserId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const history = await getWorkoutHistory(request.authUserId);
    return reply.send({
      items: history.map((item) => ({
        id: item.id,
        title: item.title,
        startedAt: item.startedAt.toISOString(),
        finishedAt: item.finishedAt ? item.finishedAt.toISOString() : null,
        exercisesCount: item.exercisesCount,
        setsCount: item.setsCount,
        totalVolume: Number(item.totalVolume.toFixed(2))
      }))
    });
  });

  server.get<{ Params: { id: string } }>(
    "/workouts/:id",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.authUserId) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const workout = await getWorkoutDetails(request.authUserId, request.params.id);
      if (!workout) {
        return reply.code(404).send({ message: "Workout not found" });
      }

      return reply.send({
        id: workout.id,
        title: workout.title,
        status: workout.status,
        startedAt: workout.startedAt.toISOString(),
        finishedAt: workout.finishedAt ? workout.finishedAt.toISOString() : null,
        totalVolume: Number(workout.totalVolume.toFixed(2)),
        exercises: workout.exercises.map((item) => ({
          id: item.id,
          orderIndex: item.orderIndex,
          exercise: {
            id: item.exercise.id,
            name: item.exercise.name,
            category: {
              id: item.exercise.category.id,
              slug: item.exercise.category.slug,
              name: item.exercise.category.name
            }
          },
          sets: item.sets.map((set) => ({
            id: set.id,
            setIndex: set.setIndex,
            weightKg: set.weightKg === null ? null : Number(set.weightKg),
            reps: set.reps,
            setType: set.setType
          }))
        }))
      });
    }
  );
}
