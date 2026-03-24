import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import type { Station } from "@/types/station";
import { DesktopSidebar } from "@/features/stations";
import MapTabContent from "@/pages/MapTabContent";

const STATION_PARAM = "station";

export default function MapRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stationIdFromUrl = searchParams.get(STATION_PARAM);

  const {
    isLoading,
    filteredStations,
    stations,
    setSelectedStation,
  } = useApp();

  const [showFilters, setShowFilters] = useState(false);
  const [detailStation, setDetailStation] = useState<Station | null>(null);

  const stationById = useMemo(() => {
    if (!stationIdFromUrl) return null;
    return stations.find((s) => s.id === stationIdFromUrl) ?? null;
  }, [stations, stationIdFromUrl]);

  useEffect(() => {
    if (!stationById) return;
    setSelectedStation(stationById);
    setDetailStation(stationById);
  }, [setSelectedStation, stationById]);

  const setStationParam = useCallback(
    (stationId: string | null) => {
      const next = new URLSearchParams(searchParams);
      if (stationId) next.set(STATION_PARAM, stationId);
      else next.delete(STATION_PARAM);
      navigate({ pathname: "/", search: next.toString() ? `?${next.toString()}` : "" }, { replace: true });
    },
    [navigate, searchParams]
  );

  const handleStationSelect = (station: Station) => {
    setSelectedStation(station);
    setDetailStation(station);
    setStationParam(station.id);
  };

  const handleCloseDetail = () => {
    setDetailStation(null);
    setSelectedStation(null);
    setStationParam(null);
  };

  return (
    <div
      className="min-h-screen w-full overflow-hidden bg-background flex min-h-0"
      style={{ height: "var(--app-height, 100dvh)" }}
    >
      <DesktopSidebar
        stations={filteredStations}
        onStationSelect={handleStationSelect}
        onOpenFilters={() => setShowFilters(true)}
        isLoading={isLoading}
      />

      <div className="flex-1 relative min-h-0">
        <MapTabContent
          stations={filteredStations}
          isLoading={isLoading}
          showFilters={showFilters}
          onOpenFilters={() => setShowFilters(true)}
          onCloseFilters={() => setShowFilters(false)}
          detailStation={detailStation}
          onStationSelect={handleStationSelect}
          onCloseDetail={handleCloseDetail}
        />
      </div>
    </div>
  );
}

