import type { FastifyBaseLogger } from "fastify";

type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    text?: string;
    chat: {
      id: number;
    };
  };
};

type TelegramGetUpdatesResponse = {
  ok: boolean;
  result: TelegramUpdate[];
};

const TELEGRAM_API_BASE = "https://api.telegram.org";

function buildApiUrl(botToken: string, method: string): string {
  return `${TELEGRAM_API_BASE}/bot${botToken}/${method}`;
}

async function sendStartMessage(
  botToken: string,
  chatId: number,
  miniAppUrl: string
): Promise<void> {
  const response = await fetch(buildApiUrl(botToken, "sendMessage"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: "GymLog Mini - быстрый трекер силовых тренировок в Telegram.\nНачните тренировку за пару нажатий и отслеживайте прогресс.",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Открыть приложение",
              web_app: {
                url: miniAppUrl
              }
            }
          ]
        ]
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to send /start message: ${response.status}`);
  }
}

async function fetchUpdates(
  botToken: string,
  offset: number | undefined
): Promise<TelegramGetUpdatesResponse> {
  const response = await fetch(buildApiUrl(botToken, "getUpdates"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      timeout: 25,
      offset
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch updates: ${response.status}`);
  }

  return (await response.json()) as TelegramGetUpdatesResponse;
}

export function startTelegramBot(logger: FastifyBaseLogger): void {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const miniAppUrl = process.env.TELEGRAM_MINIAPP_URL;
  const enableBotPolling = process.env.TELEGRAM_BOT_POLLING_ENABLED === "true";

  if (!enableBotPolling) {
    logger.info("Telegram bot polling is disabled");
    return;
  }

  if (!botToken || !miniAppUrl) {
    logger.warn("Telegram bot polling skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_MINIAPP_URL is missing");
    return;
  }

  let offset: number | undefined;

  const poll = async (): Promise<void> => {
    try {
      const updates = await fetchUpdates(botToken, offset);
      if (!updates.ok) {
        return;
      }

      for (const update of updates.result) {
        offset = update.update_id + 1;
        const messageText = update.message?.text?.trim();
        const chatId = update.message?.chat.id;

        if (!chatId || messageText !== "/start") {
          continue;
        }

        await sendStartMessage(botToken, chatId, miniAppUrl);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown polling error";
      logger.error({ message }, "Telegram bot polling error");
    } finally {
      setImmediate(() => {
        void poll();
      });
    }
  };

  logger.info("Telegram bot polling started");
  void poll();
}
