export type NetworkAppPlatform = "android" | "ios" | "other";

type NetworkAppLink = {
  iosUrl: string;
  androidUrl: string;
};

/**
 * Verified store links per operator (based on official listing URLs).
 * Keys must match `Station.operator` values coming from `src/data/stations.ts`.
 */
const NETWORK_APP_LINKS: Record<string, NetworkAppLink> = {
  // Tesla Central Asia -> Tesla
  "Tesla Central Asia": {
    iosUrl: "https://apps.apple.com/us/app/tesla/id582007913",
    androidUrl: "https://play.google.com/store/apps/details?id=com.teslamotors.tesla",
  },
  // ChargePoint UZ -> ChargePoint
  "ChargePoint UZ": {
    iosUrl: "https://apps.apple.com/us/app/chargepoint/id356866743",
    androidUrl: "https://play.google.com/store/apps/details?id=com.coulombtech",
  },
};

function detectPlatform(platformHint?: string): NetworkAppPlatform {
  const hint = (platformHint || "").toLowerCase();
  if (hint === "android") return "android";
  if (hint === "ios") return "ios";

  // Fallback for non-Telegram environments.
  if (typeof navigator !== "undefined") {
    const ua = navigator.userAgent || "";
    if (/iPad|iPhone|iPod/i.test(ua)) return "ios";
    if (/Android/i.test(ua)) return "android";
  }

  return "other";
}

export function getNetworkAppUrl(operator: string, platformHint?: string): string | null {
  const key = operator?.trim();
  if (!key) return null;

  const entry = NETWORK_APP_LINKS[key];
  if (!entry) return null;

  const detected = detectPlatform(platformHint);

  // Requested behavior:
  // - android -> android store
  // - ios -> ios store
  // - unknown/other -> prefer iOS first, otherwise android
  if (detected === "android") return entry.androidUrl;
  return entry.iosUrl || entry.androidUrl;
}

export function hasNetworkApp(operator: string): boolean {
  const key = operator?.trim();
  if (!key) return false;
  return Boolean(NETWORK_APP_LINKS[key]);
}

