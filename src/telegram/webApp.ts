import WebApp from "@twa-dev/sdk";

/** CSS variables follow https://core.telegram.org/bots/webapps#css-variables */
function applyThemeParamsToDocument(): void {
  const root = document.documentElement;
  const params = WebApp.themeParams as Record<string, string | undefined>;
  for (const [key, value] of Object.entries(params)) {
    if (value && typeof value === "string") {
      const cssVar = `--tg-theme-${key.replace(/_/g, "-")}`;
      root.style.setProperty(cssVar, value);
    }
  }
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
    applyThemeParamsToDocument();
    applyViewportVars();

    try {
      WebApp.setHeaderColor("bg_color");
      WebApp.setBackgroundColor("bg_color");
    } catch {
      /* older clients */
    }

    const onThemeChanged = (): void => {
      applyThemeParamsToDocument();
      try {
        WebApp.setHeaderColor("bg_color");
        WebApp.setBackgroundColor("bg_color");
      } catch {
        /* ignore */
      }
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
