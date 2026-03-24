import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Station } from '@/types/station';
import { useApp } from '@/context/AppContext';
import { useI18n } from '@/lib/i18n';

function createIcon(isSelected: boolean, status: string) {
  const colorMap: Record<string, string> = {
    available: '#38BDF8',
    busy: '#F87171',
    limited: '#F59E0B',
    unknown: '#64748B',
  };
  const color = colorMap[status] || '#64748B';
  const size = isSelected ? 32 : 24;

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:2px solid ${isSelected ? '#fff' : color};
      border-radius:50%;
      box-shadow:0 2px 8px ${color}40${isSelected ? ',0 0 0 4px ' + color + '30' : ''};
      display:flex;align-items:center;justify-content:center;
      transition:all 0.2s cubic-bezier(0.16,1,0.3,1);
    ">
      <svg width="${size * 0.42}" height="${size * 0.42}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapUpdater({ selectedStation }: { selectedStation: Station | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedStation) {
      map.flyTo([selectedStation.latitude, selectedStation.longitude], 15, { duration: 0.6 });
    }
  }, [selectedStation, map]);
  return null;
}

interface Props {
  stations: Station[];
  onStationSelect: (s: Station) => void;
  resizeSignal?: string;
}

function MapSizeController({ resizeSignal }: { resizeSignal?: string }) {
  const map = useMap();

  useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    let timeoutId = 0;

    const invalidate = () => {
      map.invalidateSize({ pan: false, debounceMoveend: true });
    };

    const scheduleInvalidate = () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(timeoutId);

      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          invalidate();
        });
      });

      // Fallback for slower WebView animation/layout updates.
      timeoutId = window.setTimeout(invalidate, 220);
    };

    const handleResize = () => scheduleInvalidate();
    const visualViewport = window.visualViewport;

    scheduleInvalidate();
    window.addEventListener("resize", handleResize, { passive: true });
    visualViewport?.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
      visualViewport?.removeEventListener("resize", handleResize);
    };
  }, [map, resizeSignal]);

  return null;
}

export default function StationMap({ stations, onStationSelect, resizeSignal }: Props) {
  const { selectedStation } = useApp();
  const { t } = useI18n();

  return (
    <MapContainer
      center={[41.311081, 69.279737]}
      zoom={12}
      className="w-full h-full"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      <MapUpdater selectedStation={selectedStation} />
      <MapSizeController resizeSignal={resizeSignal} />
      {stations.map(station => (
        <Marker
          key={station.id}
          position={[station.latitude, station.longitude]}
          icon={createIcon(selectedStation?.id === station.id, station.availability_status)}
          eventHandlers={{ click: () => onStationSelect(station) }}
        >
          <Popup>
            <div className="font-body min-w-[180px]">
              <p className="font-display font-semibold text-[13px] text-foreground leading-tight">{station.name}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{station.operator}</p>
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
                <span>{station.max_power_kw} {t('station.kw')}</span>
                <span className="text-border">·</span>
                <span>{station.ports_count} {t('station.ports')}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
