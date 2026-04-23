import crypto from "node:crypto";

export type TelegramUserPayload = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

function parseInitData(initData: string): URLSearchParams {
  return new URLSearchParams(initData);
}

export function validateTelegramInitData(initData: string, botToken: string): boolean {
  const params = parseInitData(initData);
  const hash = params.get("hash");

  if (!hash) {
    return false;
  }

  const dataCheckString = Array.from(params.entries())
    .filter(([key]) => key !== "hash")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return calculatedHash === hash;
}

export function extractTelegramUser(initData: string): TelegramUserPayload | null {
  const params = parseInitData(initData);
  const rawUser = params.get("user");

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as TelegramUserPayload;
  } catch {
    return null;
  }
}
