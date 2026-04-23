export type TelegramAuthRequestBody = {
  initData: string;
};

export type TelegramAuthResponse = {
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    username: string | null;
  };
};
