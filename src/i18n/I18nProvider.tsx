"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { getDir, getStoredLang, setStoredLang, type LanguageCode } from "./languages";
import "./config";

/**
 * Syncs document lang/dir with the active i18next language and persists the
 * choice. Arabic flips the whole layout to RTL.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const { i18n, ready } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = getStoredLang();
    if (stored !== i18n.language) void i18n.changeLanguage(stored);
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    const code = (i18n.language || "en").slice(0, 2) as LanguageCode;
    document.documentElement.lang = code;
    document.documentElement.dir = getDir(code);
  }, [i18n.language, ready]);

  void mounted;

  return <>{children}</>;
}

/** Hook used by the language switcher. */
export function useChangeLanguage() {
  const { i18n } = useTranslation();
  return (code: LanguageCode) => {
    setStoredLang(code);
    void i18n.changeLanguage(code);
  };
}
