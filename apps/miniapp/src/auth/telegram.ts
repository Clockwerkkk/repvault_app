export function getTelegramInitDataFromWindow(): string {
  const maybeTelegram = (window as Window & {
    Telegram?: {
      WebApp?: {
        initData?: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
          };
        };
      };
    };
  }).Telegram;

  const sdkInitData = maybeTelegram?.WebApp?.initData?.trim();
  if (sdkInitData) {
    return sdkInitData;
  }

  // В некоторых окружениях Telegram прокидывает initData в tgWebAppData параметр URL.
  const fromSearch = new URLSearchParams(window.location.search).get("tgWebAppData");
  if (fromSearch) {
    return decodeURIComponent(fromSearch);
  }

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const fromHash = hashParams.get("tgWebAppData");
  if (fromHash) {
    return decodeURIComponent(fromHash);
  }

  return "";
}
