import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { EffectiveTheme } from "@/theme/types";
import { MAP_BASEMAP } from "@/theme/mapTiles";

interface Props {
  mapTheme: EffectiveTheme;
}

/**
 * Подложка карты: при смене темы старый tile-слой снимается и создаётся новый
 * (надёжнее, чем полагаться только на `key` у `<TileLayer>` внутри MapContainer).
 */
export function MapBasemapLayer({ mapTheme }: Props) {
  const map = useMap();

  useEffect(() => {
    const spec = MAP_BASEMAP[mapTheme];
    const layer = L.tileLayer(spec.url, {
      subdomains: spec.subdomains,
      maxZoom: 20,
      minZoom: 1,
    });
    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, mapTheme]);

  return null;
}
