import { prisma } from "../../common/prisma.js";
import type { TelegramUserPayload } from "../auth/telegram-auth.util.js";

export async function upsertUserByTelegram(
  telegramUser: TelegramUserPayload
): Promise<{
  id: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
}> {
  const firstName = telegramUser.first_name?.trim() || "Telegram User";
  const lastName = telegramUser.last_name?.trim() || null;
  const username = telegramUser.username?.trim() || null;

  const user = await prisma.user.upsert({
    where: {
      telegramUserId: String(telegramUser.id)
    },
    update: {
      firstName,
      lastName,
      username
    },
    create: {
      telegramUserId: String(telegramUser.id),
      firstName,
      lastName,
      username
    }
  });

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username
  };
}
