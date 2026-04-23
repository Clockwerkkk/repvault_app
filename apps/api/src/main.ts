import Fastify from "fastify";
import cors from "@fastify/cors";
import { appModuleName } from "./app.module.js";
import { prisma } from "./common/prisma.js";
import { registerAuthController } from "./modules/auth/auth.controller.js";
import { startTelegramBot } from "./modules/bot/telegram-bot.js";
import { registerExercisesController } from "./modules/exercises/exercises.controller.js";
import { registerHealthController } from "./modules/health/health.controller.js";
import { registerHomeController } from "./modules/home/home.controller.js";
import { registerSetsController } from "./modules/sets/sets.controller.js";
import { registerWorkoutsController } from "./modules/workouts/workouts.controller.js";

async function bootstrap(): Promise<void> {
  const server = Fastify({ logger: true });
  const port = Number(process.env.PORT ?? 3001);
  const corsOrigin = process.env.CORS_ORIGIN ?? true;

  await server.register(cors, {
    origin: corsOrigin
  });

  await registerHealthController(server);
  await registerAuthController(server);
  await registerHomeController(server);
  await registerWorkoutsController(server);
  await registerExercisesController(server);
  await registerSetsController(server);

  await server.listen({ port, host: "0.0.0.0" });
  server.log.info({ app: appModuleName, port }, "API started");
  startTelegramBot(server.log);
}

bootstrap().catch((error: unknown) => {
  // Комментарии в коде ведем на русском по правилам проекта.
  console.error("Failed to start API", error);
  prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
