import { useEffect, useState } from 'react';

export interface UserGeolocationPosition {
  latitude: number;
  longitude: number;
  /** Horizontal accuracy in meters (from Geolocation API). */
  accuracyM: number;
}

/**
 * Subscribes to the device geolocation while mounted (watchPosition).
 * Returns null until the first fix or forever if denied / unavailable.
 */
export function useWatchUserGeolocation(active: boolean): UserGeolocationPosition | null {
  const [position, setPosition] = useState<UserGeolocationPosition | null>(null);

  useEffect(() => {
    if (!active || !('geolocation' in navigator)) {
      return;
    }

    const onSuccess = (pos: GeolocationPosition) => {
      setPosition({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracyM: pos.coords.accuracy ?? 50,
      });
    };

    const onError = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED) {
        setPosition(null);
      }
    };

    const id = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      maximumAge: 10_000,
      timeout: 20_000,
    });

    return () => navigator.geolocation.clearWatch(id);
  }, [active]);

  return position;
}
