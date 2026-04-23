import type { FastifyInstance } from "fastify";
import type { TelegramAuthRequestBody } from "./dto/auth.dto.js";
import { authenticateByTelegram } from "./auth.service.js";

export async function registerAuthController(server: FastifyInstance): Promise<void> {
  server.post<{ Body: TelegramAuthRequestBody }>("/auth/telegram", async (request, reply) => {
    const initData = request.body?.initData;

    if (!initData || typeof initData !== "string") {
      return reply.code(400).send({ message: "initData is required" });
    }

    try {
      const result = await authenticateByTelegram(initData);
      return reply.send(result);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Auth failed";
      request.log.warn(
        {
          errorMessage,
          initDataLength: initData.length,
          hasHash: initData.includes("hash="),
          hasUser: initData.includes("user=")
        },
        "Telegram auth failed"
      );
      const statusCode = errorMessage.includes("Invalid Telegram initData") ? 401 : 400;
      return reply.code(statusCode).send({ message: errorMessage });
    }
  });
}
