import { useEffect, useMemo } from 'react';
import { Circle, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation } from 'lucide-react';
import { useWatchUserGeolocation } from '@/hooks/useWatchUserGeolocation';
import { useApp } from '@/context/AppContext';
import { useI18n } from '@/lib/i18n';
import { useAppTheme } from '@/theme/ThemeProvider';

function readCssHslTriplet(varName: string): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return raw ? `hsl(${raw})` : 'hsl(190 100% 36%)';
}

function createUserLocationIcon(primary: string) {
  return L.divIcon({
    className: 'user-location-marker',
    html: `<div class="user-location-dot" style="--user-loc-primary:${primary}"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

/** Clamp accuracy circle so it stays readable on the map. */
function accuracyRadiusM(accuracyM: number): number {
  return Math.min(Math.max(accuracyM, 12), 130);
}

/**
 * Live user position (watchPosition), accuracy ring, dot, and “my location” control.
 * Must render inside {@link MapContainer}.
 */
export function UserLocationOnMap() {
  const map = useMap();
  const { t } = useI18n();
  const { setUserGeolocation } = useApp();
  const { effectiveTheme } = useAppTheme();
  const position = useWatchUserGeolocation(true);

  useEffect(() => {
    if (!position) return;
    setUserGeolocation({ latitude: position.latitude, longitude: position.longitude });
  }, [position, setUserGeolocation]);

  const primaryColor = useMemo(() => {
    void effectiveTheme;
    return readCssHslTriplet('--primary');
  }, [effectiveTheme]);

  const userIcon = useMemo(() => createUserLocationIcon(primaryColor), [primaryColor]);

  const flyToUser = () => {
    if (position) {
      map.flyTo([position.latitude, position.longitude], Math.max(map.getZoom(), 15), {
        duration: 0.45,
      });
      return;
    }
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 15, { duration: 0.45 });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 15_000 },
    );
  };

  return (
    <>
      {position && (
        <>
          <Circle
            center={[position.latitude, position.longitude]}
            radius={accuracyRadiusM(position.accuracyM)}
            pathOptions={{
              color: primaryColor,
              fillColor: primaryColor,
              fillOpacity: 0.14,
              weight: 1,
              opacity: 0.4,
            }}
          />
          <Marker
            position={[position.latitude, position.longitude]}
            icon={userIcon}
            interactive={false}
            zIndexOffset={650}
          />
        </>
      )}
      <div className="pointer-events-none fixed z-[940] right-3 bottom-[calc(168px+env(safe-area-inset-bottom,0px))] lg:bottom-8">
        <button
          type="button"
          onClick={flyToUser}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-xl bg-card text-foreground shadow-elevated border border-border/60 hover:bg-card-elevated transition-colors"
          aria-label={t('map.my_location')}
          title={t('map.my_location')}
        >
          <Navigation className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>
    </>
  );
}
