"use client";

import { useCallback, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "@/config/site";

type Theme = "light" | "dark";

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const read = (): Theme => (document.documentElement.classList.contains("dark") ? "dark" : "light");

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => "light" as Theme);

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // private mode — the class still applies for this visit
    }
    listeners.forEach((listener) => listener());
  }, []);

  const toggle = useCallback(() => setTheme(read() === "dark" ? "light" : "dark"), [setTheme]);

  return { theme, setTheme, toggle };
}
