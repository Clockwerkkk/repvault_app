import { useMemo, useState } from "react";
import { messages, type Language, type MessageKey } from "./messages";

const LANGUAGE_STORAGE_KEY = "gymlog-mini-language";

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_fullMatch, key: string) => {
    if (!(key in params)) {
      return `{${key}}`;
    }
    return String(params[key]);
  });
}

function loadInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return "ru";
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === "ru" || stored === "en") {
    return stored;
  }

  return "ru";
}

export function useI18n() {
  const [language, setLanguageState] = useState<Language>(loadInitialLanguage);

  const setLanguage = (nextLanguage: Language): void => {
    setLanguageState(nextLanguage);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    }
  };

  const t = useMemo(
    () =>
      (key: MessageKey, params?: Record<string, string | number>) =>
        interpolate(messages[language][key], params),
    [language]
  );

  return { language, setLanguage, t };
}
