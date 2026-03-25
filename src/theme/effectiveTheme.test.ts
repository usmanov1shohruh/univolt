import { describe, it, expect } from "vitest";
import { resolveEffectiveTheme } from "@/theme/effectiveTheme";
import { ThemeMode } from "@/theme/types";

describe("resolveEffectiveTheme", () => {
  it("prefers explicit light/dark over system sources", () => {
    expect(
      resolveEffectiveTheme(ThemeMode.Light, {
        systemPrefersDark: true,
        telegramDarkHint: true,
      }),
    ).toBe("light");
    expect(
      resolveEffectiveTheme(ThemeMode.Dark, {
        systemPrefersDark: false,
        telegramDarkHint: false,
      }),
    ).toBe("dark");
  });

  it("uses Telegram hint in system mode when available", () => {
    expect(
      resolveEffectiveTheme(ThemeMode.System, {
        systemPrefersDark: false,
        telegramDarkHint: true,
      }),
    ).toBe("dark");
    expect(
      resolveEffectiveTheme(ThemeMode.System, {
        systemPrefersDark: true,
        telegramDarkHint: false,
      }),
    ).toBe("light");
  });

  it("falls back to OS preference when Telegram hint is absent", () => {
    expect(
      resolveEffectiveTheme(ThemeMode.System, {
        systemPrefersDark: true,
        telegramDarkHint: null,
      }),
    ).toBe("dark");
    expect(
      resolveEffectiveTheme(ThemeMode.System, {
        systemPrefersDark: false,
        telegramDarkHint: null,
      }),
    ).toBe("light");
  });
});
