"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "supreme-theme";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}>({
  theme: "dark",
  setTheme: () => {},
  toggle: () => {},
});

/**
 * Runs before first paint so the correct palette is on <html> from the very
 * first frame. Without this the page would render dark then flash to light.
 */
export function setInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const prefersLight =
      window.matchMedia?.("(prefers-color-scheme: light)").matches ?? false;
    const next: Theme = stored ?? (prefersLight ? "light" : "dark");
    document.documentElement.dataset.theme = next;
  } catch {
    document.documentElement.dataset.theme = "dark";
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    setInitialTheme();
    const applied =
      (document.documentElement.dataset.theme as Theme | undefined) ?? "dark";
    setThemeState(applied);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage blocked — session-only theme is fine */
    }
  }, []);

  const toggle = useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [theme, setTheme],
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
