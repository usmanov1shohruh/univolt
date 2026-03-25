import type { EffectiveTheme } from "@/theme/types";

/**
 * Carto basemaps — без `{r}` в шаблоне: в стандартном L.tileLayer плейсхолдер `{r}`
 * не подставляется, из‑за этого часть клиентов получала битый URL и «чёрную» карту.
 */
export const MAP_BASEMAP: Record<
  EffectiveTheme,
  { url: string; subdomains: string }
> = {
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    subdomains: "abcd",
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    subdomains: "abcd",
  },
};
