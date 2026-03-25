export type NetworkAppPlatform = "android" | "ios" | "other";

type NetworkAppLink = {
  iosUrl?: string;
  androidUrl?: string;
};

/**
 * Verified store links per charging network.
 *
 * Keys must match `Station.operator`, which comes from backend `station.network`
 * (see `backend/src/stations/stations.seed.json`).
 */
const NETWORK_APP_LINKS: Record<string, NetworkAppLink> = {
  // Beon
  Beon: {
    androidUrl: "https://play.google.com/store/apps/details?id=uz.beonapp.uz&hl=uz&gl=UZ",
  },

  // Ebb
  Ebb: {
    androidUrl: "https://play.google.com/store/apps/details?id=org.uicgroup.ebbchargerapp&hl=uz&gl=UZ",
    iosUrl: "https://apps.apple.com/app/ebb/id6472716648",
  },

  // EnerGo
  EnerGo: {
    androidUrl: "https://play.google.com/store/apps/details?id=uz.energocharge.energocharge&hl=uz&gl=UZ",
  },

  // Gigawatt
  Gigawatt: {
    androidUrl: "https://play.google.com/store/apps/details?id=uz.felix.gigawatt&hl=uz&gl=UZ",
  },

  // GreenTE / Tezroq
  "GreenTE / Tezroq": {
    androidUrl: "https://play.google.com/store/apps/details?id=com.green.te&hl=uz&gl=UZ",
    iosUrl: "https://apps.apple.com/uz/app/greente/id6444043502",
  },

  // Megawatt Energy
  "Megawatt Energy": {
    androidUrl: "https://play.google.com/store/apps/details?id=com.charging123.megawatt&hl=uz&gl=UZ",
    // Official iOS App Store page is unknown by slug, but ID is confirmed.
    iosUrl: "https://apps.apple.com/app/id1620065448",
  },

  // Protok
  Protok: {
    // iOS confirmed by store listing.
    iosUrl: "https://apps.apple.com/app/pro-tok/id6447674074",
  },

  // Quwatt
  Quwatt: {
    iosUrl: "https://apps.apple.com/uz/app/quwatt/id6475059763",
  },

  // Spectre Energy
  "Spectre Energy": {
    androidUrl: "https://play.google.com/store/apps/details?id=uz.spectreEnergy.uz&hl=uz&gl=UZ",
    iosUrl: "https://apps.apple.com/uz/app/spectre-energy/id6458980609",
  },

  // Tok Bor
  "Tok Bor": {
    androidUrl: "https://play.google.com/store/apps/details?id=uz.tokbor.tokbor&hl=uz&gl=UZ",
    iosUrl: "https://apps.apple.com/app/tokbor/id1562120388",
  },

  // Urban Power (Android seems to use the same app as EBB in the store)
  "Urban Power": {
    androidUrl: "https://play.google.com/store/apps/details?id=org.uicgroup.ebbchargerapp&hl=uz&gl=UZ",
    iosUrl: "https://apps.apple.com/app/urban-power/id6736947764",
  },

  // Mustang Energy
  "Mustang Energy": {
    androidUrl: "https://play.google.com/store/apps/details?id=org.uicgroup.mustang&hl=uz&gl=UZ",
    iosUrl: "https://apps.apple.com/app/mustang-energy/id6504628696",
  },

  // UEnergy (Android)
  "UEnergy": {
    androidUrl: "https://play.google.com/store/apps/details?id=u.energy.client_mobile&hl=uz&gl=UZ",
  },

  // Q-watt (Android)
  "Q-watt": {
    androidUrl: "https://play.google.com/store/apps/details?id=com.q.watt&hl=uz&gl=UZ",
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
  if (detected === "android") return entry.androidUrl ?? null;
  if (detected === "ios") return entry.iosUrl ?? null;
  return entry.iosUrl ?? entry.androidUrl ?? null;
}

export function hasNetworkApp(operator: string): boolean {
  const key = operator?.trim();
  if (!key) return false;
  const entry = NETWORK_APP_LINKS[key];
  return Boolean(entry?.iosUrl || entry?.androidUrl);
}

