import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../common/auth-middleware.js";
import { getHomeSummary } from "./home.service.js";

export async function registerHomeController(server: FastifyInstance): Promise<void> {
  server.get("/home/summary", { preHandler: requireAuth }, async (request, reply) => {
    if (!request.authUserId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const summary = await getHomeSummary(request.authUserId);
    return reply.send(summary);
  });
}
