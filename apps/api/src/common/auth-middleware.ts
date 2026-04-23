import type { FastifyReply, FastifyRequest } from "fastify";
import { verifySessionToken } from "./session.js";

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authorizationHeader = request.headers.authorization;
  const token = authorizationHeader?.startsWith("Bearer ")
    ? authorizationHeader.slice("Bearer ".length)
    : null;
  const sessionSecret = process.env.SESSION_SECRET ?? "dev-session-secret";

  if (!token) {
    await reply.code(401).send({ message: "Missing auth token" });
    return;
  }

  const payload = verifySessionToken(token, sessionSecret);
  if (!payload) {
    await reply.code(401).send({ message: "Invalid auth token" });
    return;
  }

  request.authUserId = payload.userId;
}
