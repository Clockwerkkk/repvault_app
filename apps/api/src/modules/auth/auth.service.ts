import { createSessionToken } from "../../common/session.js";
import crypto from "node:crypto";
import { upsertUserByTelegram } from "../users/users.service.js";
import { extractTelegramUser, validateTelegramInitData } from "./telegram-auth.util.js";

function buildInsecureFallbackUser(initData: string) {
  // Для dev-режима генерируем стабильный id из входной строки.
  const seed = initData || "dev-user";
  const digest = crypto.createHash("sha256").update(seed).digest("hex");
  const numericId = Number.parseInt(digest.slice(0, 10), 16) % 2_000_000_000;

  return {
    id: numericId,
    first_name: "Dev",
    last_name: "User",
    username: `dev_${numericId}`
  };
}

export async function authenticateByTelegram(initData: string): Promise<{
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    username: string | null;
  };
}> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const isProduction = process.env.NODE_ENV === "production";
  const allowInsecureTelegramAuth =
    !isProduction && process.env.ALLOW_INSECURE_TELEGRAM_AUTH === "true";
  if (!botToken && !allowInsecureTelegramAuth) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set");
  }

  const isValid = botToken ? validateTelegramInitData(initData, botToken) : false;
  if (!isValid && !allowInsecureTelegramAuth) {
    throw new Error("Invalid Telegram initData");
  }

  const telegramUser =
    extractTelegramUser(initData) ??
    (allowInsecureTelegramAuth ? buildInsecureFallbackUser(initData) : null);
  if (!telegramUser) {
    throw new Error("Telegram user is missing in initData");
  }

  const user = await upsertUserByTelegram(telegramUser);
  const sessionSecret = process.env.SESSION_SECRET ?? "dev-session-secret";
  const token = createSessionToken(user.id, sessionSecret);

  return { token, user };
}
