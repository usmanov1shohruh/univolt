import { ThemeMode, type ThemeMode as UserThemePreference } from "@/theme/types";

/** Keep in sync with the boot script in `index.html` (avoids flash + stuck `.dark`). */
export const THEME_MODE_STORAGE_KEY = "univolt-theme-mode";

const THEME_MODE_KEY = THEME_MODE_STORAGE_KEY;

export function loadThemeMode(): UserThemePreference {
  try {
    const raw = localStorage.getItem(THEME_MODE_KEY);
    if (
      raw === ThemeMode.System ||
      raw === ThemeMode.Light ||
      raw === ThemeMode.Dark
    ) {
      return raw;
    }
  } catch {
    /* ignore */
  }
  return ThemeMode.System;
}

export function saveThemeMode(mode: UserThemePreference): void {
  try {
    localStorage.setItem(THEME_MODE_KEY, mode);
  } catch {
    /* ignore */
  }
}
