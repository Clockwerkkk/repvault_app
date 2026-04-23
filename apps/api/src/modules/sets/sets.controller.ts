import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../common/auth-middleware.js";
import type { CreateSetBody, UpdateSetBody } from "./dto/sets.dto.js";
import { createSet, deleteSet, updateSet } from "./sets.service.js";

function mapSetResponse(set: {
  id: string;
  setIndex: number;
  weightKg: { toNumber(): number } | number;
  reps: number;
  setType: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: set.id,
    setIndex: set.setIndex,
    weightKg: typeof set.weightKg === "number" ? set.weightKg : set.weightKg.toNumber(),
    reps: set.reps,
    setType: set.setType,
    createdAt: set.createdAt.toISOString(),
    updatedAt: set.updatedAt.toISOString()
  };
}

export async function registerSetsController(server: FastifyInstance): Promise<void> {
  server.post<{ Params: { id: string }; Body: CreateSetBody }>(
    "/workout-exercises/:id/sets",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.authUserId) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const result = await createSet(request.authUserId, request.params.id, {
        weightKg: Number(request.body?.weightKg),
        reps: Number(request.body?.reps),
        setType: request.body?.setType ?? "working"
      });

      if (result.status === "not_found") {
        return reply.code(404).send({ message: "Workout exercise not found" });
      }

      if (result.status === "validation_error") {
        return reply.code(400).send({ message: result.message });
      }

      return reply.code(201).send(mapSetResponse(result.set));
    }
  );

  server.patch<{ Params: { id: string }; Body: UpdateSetBody }>(
    "/sets/:id",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.authUserId) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const result = await updateSet(request.authUserId, request.params.id, {
        weightKg:
          request.body?.weightKg === undefined ? undefined : Number(request.body.weightKg),
        reps: request.body?.reps === undefined ? undefined : Number(request.body.reps),
        setType: request.body?.setType
      });

      if (result.status === "not_found") {
        return reply.code(404).send({ message: "Set not found" });
      }

      if (result.status === "validation_error") {
        return reply.code(400).send({ message: result.message });
      }

      return reply.send(mapSetResponse(result.set));
    }
  );

  server.delete<{ Params: { id: string } }>(
    "/sets/:id",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.authUserId) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const result = await deleteSet(request.authUserId, request.params.id);
      if (result.status === "not_found") {
        return reply.code(404).send({ message: "Set not found" });
      }

      return reply.code(204).send();
    }
  );
}
