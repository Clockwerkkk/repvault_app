import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { extractTelegramUser, validateTelegramInitData } from "./telegram-auth.util.js";

function buildSignedInitData(botToken: string, userJson: string): string {
  const params = new URLSearchParams();
  params.set("auth_date", "1710000000");
  params.set("query_id", "AAHdF6IQAAAAAN0XohDhrOrc");
  params.set("user", userJson);

  const dataCheckString = Array.from(params.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const hash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  params.set("hash", hash);

  return params.toString();
}

describe("telegram auth util", () => {
  it("validates correct signed initData", () => {
    const botToken = "test-bot-token";
    const userJson = JSON.stringify({ id: 123, first_name: "Igor", username: "igor" });
    const initData = buildSignedInitData(botToken, userJson);

    expect(validateTelegramInitData(initData, botToken)).toBe(true);
  });

  it("rejects tampered initData", () => {
    const botToken = "test-bot-token";
    const userJson = JSON.stringify({ id: 123, first_name: "Igor" });
    const initData = buildSignedInitData(botToken, userJson).replace("Igor", "Egor");

    expect(validateTelegramInitData(initData, botToken)).toBe(false);
  });

  it("extracts telegram user payload", () => {
    const initData = `user=${encodeURIComponent(JSON.stringify({ id: 123, first_name: "Igor" }))}`;
    const user = extractTelegramUser(initData);

    expect(user?.id).toBe(123);
    expect(user?.first_name).toBe("Igor");
  });
});
