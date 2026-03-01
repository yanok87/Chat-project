"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "minicom-theme";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const s = localStorage.getItem(THEME_STORAGE_KEY);
  if (s === "light" || s === "dark") return s;
  return "light";
}

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setThemeState(getStoredTheme());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [mounted, theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, t);
    }
  }, []);

  const value: ThemeContextValue = { theme, setTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
