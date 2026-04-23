import { apiRequest } from "./client";
import type { AuthState } from "../types";

type TelegramAuthResponse = {
  token: string;
  user: AuthState["user"];
};

export async function authenticateWithInitData(initData: string): Promise<AuthState> {
  const result = await apiRequest<TelegramAuthResponse>("/auth/telegram", {
    method: "POST",
    body: { initData }
  });

  return {
    token: result.token,
    user: result.user
  };
}
