import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import WebApp from "@twa-dev/sdk";
import { loadThemeMode, saveThemeMode } from "@/infra/storage/themeModeStorage";
import {
  applyTelegramMiniAppTheme,
  isTelegramMiniApp,
  isTelegramThemeDark,
  TELEGRAM_THEME_CHANGED_EVENT,
} from "@/telegram/webApp";
import { clearShadcnThemeInlineVars } from "@/theme/shadcnVarKeys";
import { resolveEffectiveTheme } from "@/theme/effectiveTheme";
import type { EffectiveTheme, ThemeMode } from "@/theme/types";

function subscribeSystemTheme(callback: () => void): () => void {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSystemPrefersDarkSnapshot(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getSystemPrefersDarkServer(): boolean {
  return false;
}

interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  effectiveTheme: EffectiveTheme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function telegramThemeParamsReady(): boolean {
  try {
    const p = WebApp.themeParams as Record<string, string | undefined>;
    return Boolean(p.bg_color && p.text_color);
  } catch {
    return false;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => loadThemeMode());
  const [telegramThemeTick, setTelegramThemeTick] = useState(0);

  const systemPrefersDark = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemPrefersDarkSnapshot,
    getSystemPrefersDarkServer,
  );

  useEffect(() => {
    const onTelegramTheme = (): void => setTelegramThemeTick((n) => n + 1);
    window.addEventListener(TELEGRAM_THEME_CHANGED_EVENT, onTelegramTheme);
    return () => window.removeEventListener(TELEGRAM_THEME_CHANGED_EVENT, onTelegramTheme);
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    saveThemeMode(mode);
  }, []);

  const telegramMiniApp = isTelegramMiniApp();
  const tgParamsReady = telegramMiniApp && telegramThemeParamsReady();

  const telegramDarkHint: boolean | null = tgParamsReady
    ? isTelegramThemeDark()
    : null;

  const useSystemTelegramPalette =
    themeMode === "system" && telegramMiniApp && tgParamsReady;

  const effectiveTheme = resolveEffectiveTheme(themeMode, {
    systemPrefersDark,
    telegramDarkHint,
  });

  useLayoutEffect(() => {
    const root = document.documentElement;

    if (useSystemTelegramPalette) {
      applyTelegramMiniAppTheme();
      root.classList.remove("dark");
      if (isTelegramThemeDark()) root.classList.add("dark");
    } else {
      clearShadcnThemeInlineVars(root);
      root.classList.remove("dark");
      if (effectiveTheme === "dark") root.classList.add("dark");
    }

    if (useSystemTelegramPalette) {
      try {
        WebApp.setHeaderColor("bg_color");
        WebApp.setBackgroundColor("bg_color");
      } catch {
        /* older clients */
      }
    }
  }, [
    effectiveTheme,
    themeMode,
    telegramMiniApp,
    tgParamsReady,
    useSystemTelegramPalette,
    systemPrefersDark,
    telegramThemeTick,
  ]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeMode,
      setThemeMode,
      effectiveTheme,
    }),
    [effectiveTheme, themeMode, setThemeMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within ThemeProvider");
  return ctx;
}
