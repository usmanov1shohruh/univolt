/** User preference stored in localStorage; default is {@link ThemeMode.System}. */
export const ThemeMode = {
  System: "system",
  Light: "light",
  Dark: "dark",
} as const;

export type ThemeMode = (typeof ThemeMode)[keyof typeof ThemeMode];

/** Resolved palette used for UI and map (after applying priority rules). */
export const EffectiveTheme = {
  Light: "light",
  Dark: "dark",
} as const;

export type EffectiveTheme = (typeof EffectiveTheme)[keyof typeof EffectiveTheme];
