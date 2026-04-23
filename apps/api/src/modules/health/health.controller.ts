import type { FastifyInstance } from "fastify";

export async function registerHealthController(
  server: FastifyInstance
): Promise<void> {
  server.get("/health", async () => ({
    status: "ok"
  }));
}
