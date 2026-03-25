import WebApp from "@twa-dev/sdk";

/** `#RRGGBB` → `H S% L%` for Tailwind `hsl(var(--token))` */
function hexToHslTriplet(hex: string): string | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  const r = parseInt(m[1], 16) / 255;
  const g = parseInt(m[2], 16) / 255;
  const b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function hslTripletLightness(triplet: string): number {
  const parts = triplet.trim().split(/\s+/);
  const last = parts[parts.length - 1] ?? "0%";
  return parseFloat(last.replace("%", "")) || 0;
}

/** Dispatched on `WebApp` `themeChanged` so React can re-apply palette + map. */
export const TELEGRAM_THEME_CHANGED_EVENT = "univolt:telegram-theme-changed";

/**
 * Whether Telegram's current `bg_color` reads as a dark background (Mini App / system theme).
 */
export function isTelegramThemeDark(): boolean {
  try {
    const p = WebApp.themeParams as Record<string, string | undefined>;
    const bg = p.bg_color;
    if (!bg) return false;
    const bgH = hexToHslTriplet(bg);
    if (!bgH) return false;
    return hslTripletLightness(bgH) < 50;
  } catch {
    return false;
  }
}

function tweakMutedForContrast(muted: string, foreground: string, background: string): string {
  const lBg = hslTripletLightness(background);
  const lFg = hslTripletLightness(foreground);
  const lMu = hslTripletLightness(muted);
  const fgParts = foreground.trim().split(/\s+/);
  const h = fgParts[0] ?? "0";
  const s = fgParts[1] ?? "10%";

  if (lBg < 45 && Math.abs(lMu - lBg) < 14) {
    return `${h} ${s} ${Math.min(80, Math.max(58, lFg - 22))}%`;
  }
  if (Math.abs(lFg - lMu) < 8) {
    return `${h} ${s} ${Math.min(85, lFg + 12)}%`;
  }
  return muted;
}

/**
 * Map Telegram themeParams into shadcn/Tailwind HSL variables so `text-foreground`,
 * `bg-card`, `text-muted-foreground`, etc. match the Mini App theme and stay readable.
 */
function applyShadcnTokensFromTelegramTheme(): void {
  const root = document.documentElement;
  const p = WebApp.themeParams as Record<string, string | undefined>;

  const bg = p.bg_color;
  const fg = p.text_color;
  if (!bg || !fg) return;

  const bgH = hexToHslTriplet(bg);
  const fgH = hexToHslTriplet(fg);
  if (!bgH || !fgH) return;

  const secondary = p.secondary_bg_color ? hexToHslTriplet(p.secondary_bg_color) : null;
  const cardH = secondary ?? bgH;

  const hint = p.hint_color ? hexToHslTriplet(p.hint_color) : null;
  const subtitle = p.subtitle_text_color ? hexToHslTriplet(p.subtitle_text_color) : null;
  let mutedFg =
    subtitle ??
    hint ??
    (hslTripletLightness(fgH) > 50 ? "220 12% 42%" : "220 12% 72%");
  mutedFg = tweakMutedForContrast(mutedFg, fgH, cardH);

  const cardParts = cardH.match(/^(\S+)\s+(\S+%)\s+(\S+%)$/);
  const cardL = hslTripletLightness(cardH);
  const borderL = cardL < 40 ? Math.min(90, cardL + 14) : Math.max(10, cardL - 14);
  const borderH = cardParts
    ? `${cardParts[1]} ${cardParts[2]} ${borderL}%`
    : `220 12% ${borderL}%`;

  root.style.setProperty("--background", bgH);
  root.style.setProperty("--foreground", fgH);
  root.style.setProperty("--card", cardH);
  root.style.setProperty("--card-foreground", fgH);
  root.style.setProperty("--popover", cardH);
  root.style.setProperty("--popover-foreground", fgH);
  root.style.setProperty("--secondary", cardH);
  root.style.setProperty("--secondary-foreground", fgH);
  root.style.setProperty("--muted", cardH);
  root.style.setProperty("--muted-foreground", mutedFg);
  root.style.setProperty("--border", borderH);
  root.style.setProperty("--input", borderH);

  const link = p.link_color ? hexToHslTriplet(p.link_color) : null;
  if (link) {
    root.style.setProperty("--primary", link);
    const l = hslTripletLightness(link);
    root.style.setProperty(
      "--primary-foreground",
      l > 52 ? "222 25% 8%" : "0 0% 100%",
    );
  }

  root.style.setProperty("--surface", cardH);
  root.style.setProperty("--surface-elevated", cardH);
}

/** CSS variables follow https://core.telegram.org/bots/webapps#css-variables */
export function applyTelegramMiniAppTheme(): void {
  const root = document.documentElement;
  const params = WebApp.themeParams as Record<string, string | undefined>;
  for (const [key, value] of Object.entries(params)) {
    if (value && typeof value === "string") {
      const cssVar = `--tg-theme-${key.replace(/_/g, "-")}`;
      root.style.setProperty(cssVar, value);
    }
  }
  applyShadcnTokensFromTelegramTheme();
}

function applyViewportVars(): void {
  const root = document.documentElement;
  const appInsets = WebApp as unknown as {
    safeAreaInset?: { top?: number; bottom?: number };
    contentSafeAreaInset?: { top?: number; bottom?: number };
  };
  const fallback = `${window.innerHeight}px`;
  const viewportHeight =
    typeof WebApp.viewportHeight === "number" && WebApp.viewportHeight > 0
      ? `${WebApp.viewportHeight}px`
      : fallback;
  const stableViewportHeight =
    typeof WebApp.viewportStableHeight === "number" &&
    WebApp.viewportStableHeight > 0
      ? `${WebApp.viewportStableHeight}px`
      : viewportHeight;
  const topInset =
    appInsets.contentSafeAreaInset?.top ??
    appInsets.safeAreaInset?.top ??
    0;
  const bottomInset =
    appInsets.contentSafeAreaInset?.bottom ??
    appInsets.safeAreaInset?.bottom ??
    0;

  root.style.setProperty("--tg-viewport-height", viewportHeight);
  root.style.setProperty("--tg-stable-viewport-height", stableViewportHeight);
  root.style.setProperty("--app-height", stableViewportHeight);
  root.style.setProperty("--app-safe-top", `${topInset}px`);
  root.style.setProperty("--app-safe-bottom", `${bottomInset}px`);
}

/**
 * True when the app runs inside Telegram (Mini App / Web App).
 * Outside Telegram the stub uses platform "unknown" and empty initData.
 */
export function isTelegramMiniApp(): boolean {
  try {
    return (
      (WebApp.initData?.length ?? 0) > 0 || WebApp.platform !== "unknown"
    );
  } catch {
    return false;
  }
}

/**
 * Call once at startup. Safe no-op in a normal browser.
 */
export function initTelegramWebApp(): void {
  if (!isTelegramMiniApp()) return;

  try {
    WebApp.ready();
    WebApp.expand();

    try {
      WebApp.disableVerticalSwipes();
    } catch {
      /* unsupported in older clients */
    }

    document.documentElement.classList.add("telegram-mini-app");
    applyViewportVars();

    const onThemeChanged = (): void => {
      window.dispatchEvent(new Event(TELEGRAM_THEME_CHANGED_EVENT));
    };
    const onViewportChanged = (): void => {
      applyViewportVars();
    };
    WebApp.onEvent("themeChanged", onThemeChanged);
    WebApp.onEvent("viewportChanged", onViewportChanged);
  } catch (e) {
    console.warn("[Telegram WebApp] init failed", e);
  }
}
