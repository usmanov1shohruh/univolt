import {
  ThemeMode as ThemeModeValues,
  type EffectiveTheme,
  type ThemeMode,
} from "@/theme/types";

export interface EffectiveThemeContextInput {
  /** `prefers-color-scheme: dark` in the browser. */
  systemPrefersDark: boolean;
  /**
   * When running in Telegram with usable `themeParams`, this is derived from `bg_color`.
   * Otherwise `null` (use OS preference for system mode).
   */
  telegramDarkHint: boolean | null;
}

/**
 * Resolves the palette actually shown in the UI.
 * — `light` / `dark`: user choice wins.
 * — `system`: Telegram hint when available, else OS preference.
 */
export function resolveEffectiveTheme(
  mode: ThemeMode,
  input: EffectiveThemeContextInput,
): EffectiveTheme {
  if (mode === ThemeModeValues.Light) return "light";
  if (mode === ThemeModeValues.Dark) return "dark";

  if (input.telegramDarkHint !== null) {
    return input.telegramDarkHint ? "dark" : "light";
  }

  return input.systemPrefersDark ? "dark" : "light";
}

/** Alias for {@link resolveEffectiveTheme} (same priority rules). */
export const getEffectiveTheme = resolveEffectiveTheme;
