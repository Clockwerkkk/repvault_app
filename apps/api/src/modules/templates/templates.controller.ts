import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../common/auth-middleware.js";
import {
  createTemplate,
  createTemplateFromWorkout,
  deleteTemplate,
  listWorkoutTemplates,
  startWorkoutFromTemplate,
  updateTemplate
} from "./templates.service.js";

export async function registerTemplatesController(server: FastifyInstance): Promise<void> {
  server.get("/templates", { preHandler: requireAuth }, async (request, reply) => {
    if (!request.authUserId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const items = await listWorkoutTemplates(request.authUserId);
    return reply.send({
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        exercises: item.exercises.map((templateExercise) => ({
          id: templateExercise.id,
          orderIndex: templateExercise.orderIndex,
          exercise: {
            id: templateExercise.exercise.id,
            name: templateExercise.exercise.name,
            category: {
              id: templateExercise.exercise.category.id,
              slug: templateExercise.exercise.category.slug,
              name: templateExercise.exercise.category.name
            }
          }
        }))
      }))
    });
  });

  server.post<{ Params: { id: string }; Body: { title?: string } }>(
    "/templates/from-workout/:id",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.authUserId) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const result = await createTemplateFromWorkout(
        request.authUserId,
        request.params.id,
        request.body?.title
      );
      if (result.status === "workout_not_found") {
        return reply.code(404).send({ message: "Workout not found" });
      }
      if (result.status === "empty_workout") {
        return reply.code(400).send({ message: "Workout has no exercises" });
      }

      return reply.code(201).send({ id: result.template.id, title: result.template.title });
    }
  );

  server.post<{ Body: { title?: string; exerciseIds?: string[] } }>(
    "/templates",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.authUserId) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const result = await createTemplate(request.authUserId, {
        title: request.body?.title,
        exerciseIds: request.body?.exerciseIds ?? []
      });

      if (result.status === "empty_exercises") {
        return reply.code(400).send({ message: "Template must include at least one exercise" });
      }
      if (result.status === "exercise_not_found") {
        return reply.code(404).send({ message: "One or more exercises not found" });
      }

      return reply.code(201).send({
        id: result.template.id,
        title: result.template.title
      });
    }
  );

  server.post<{ Params: { id: string } }>(
    "/templates/:id/start",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.authUserId) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const result = await startWorkoutFromTemplate(request.authUserId, request.params.id);
      if (result.status === "template_not_found") {
        return reply.code(404).send({ message: "Template not found" });
      }

      return reply.send({
        workoutId: result.workoutId,
        status: result.status
      });
    }
  );

  server.patch<{ Params: { id: string }; Body: { title?: string; exerciseIds?: string[] } }>(
    "/templates/:id",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.authUserId) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const result = await updateTemplate(request.authUserId, request.params.id, {
        title: request.body?.title,
        exerciseIds: request.body?.exerciseIds
      });

      if (!result) {
        return reply.code(404).send({ message: "Template not found" });
      }
      if (result.status === "empty_exercises") {
        return reply.code(400).send({ message: "Template must include at least one exercise" });
      }
      if (result.status === "exercise_not_found") {
        return reply.code(404).send({ message: "One or more exercises not found" });
      }

      return reply.send({
        id: result.template.id,
        title: result.template.title
      });
    }
  );

  server.delete<{ Params: { id: string } }>(
    "/templates/:id",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.authUserId) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const result = await deleteTemplate(request.authUserId, request.params.id);
      if (!result) {
        return reply.code(404).send({ message: "Template not found" });
      }

      return reply.code(204).send();
    }
  );
}
