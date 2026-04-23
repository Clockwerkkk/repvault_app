import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../common/auth-middleware.js";
import type { ExercisesQuery } from "./dto/exercises.dto.js";
import { getExerciseProgress, listExercises } from "./exercises.service.js";

export async function registerExercisesController(server: FastifyInstance): Promise<void> {
  server.get<{ Querystring: ExercisesQuery }>(
    "/exercises",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.authUserId) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const limit = request.query.limit ? Number(request.query.limit) : undefined;
      const offset = request.query.offset ? Number(request.query.offset) : undefined;

      if (limit !== undefined && Number.isNaN(limit)) {
        return reply.code(400).send({ message: "limit must be a number" });
      }

      if (offset !== undefined && Number.isNaN(offset)) {
        return reply.code(400).send({ message: "offset must be a number" });
      }

      const result = await listExercises({
        search: request.query.search,
        category: request.query.category,
        limit,
        offset
      });

      return reply.send({
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        items: result.items.map((item) => ({
          id: item.id,
          name: item.name,
          equipmentType: item.equipmentType,
          category: {
            id: item.category.id,
            slug: item.category.slug,
            name: item.category.name
          }
        }))
      });
    }
  );

  server.get<{ Params: { id: string } }>(
    "/exercises/:id/progress",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.authUserId) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const progress = await getExerciseProgress(request.authUserId, request.params.id);
      if (!progress) {
        return reply.code(404).send({ message: "Exercise not found" });
      }

      return reply.send({
        exercise: progress.exercise,
        metrics: {
          bestWeight: Number(progress.metrics.bestWeight.toFixed(2)),
          bestEstimatedOneRepMax: Number(progress.metrics.bestEstimatedOneRepMax.toFixed(2)),
          totalVolume: Number(progress.metrics.totalVolume.toFixed(2)),
          sessionsCount: progress.metrics.sessionsCount
        },
        history: progress.history.map((item) => ({
          workoutId: item.workoutId,
          date: item.date.toISOString(),
          bestWeight: Number(item.bestWeight.toFixed(2)),
          bestEstimatedOneRepMax: Number(item.bestEstimatedOneRepMax.toFixed(2)),
          volume: Number(item.volume.toFixed(2))
        }))
      });
    }
  );
}
