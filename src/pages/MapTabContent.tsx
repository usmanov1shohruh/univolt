import { AnimatePresence } from "framer-motion";
import { Station } from "@/types/station";
import {
  StationMap,
  BottomSheet,
  SearchBar,
  FilterSheet,
  StationDetail,
} from "@/features/stations";

interface MapTabContentProps {
  stations: Station[];
  isLoading: boolean;
  showFilters: boolean;
  onOpenFilters: () => void;
  onCloseFilters: () => void;
  detailStation: Station | null;
  onStationSelect: (station: Station) => void;
  onCloseDetail: () => void;
}

const MapTabContent = ({
  stations,
  isLoading,
  showFilters,
  onOpenFilters,
  onCloseFilters,
  detailStation,
  onStationSelect,
  onCloseDetail,
}: MapTabContentProps) => {
  const mapResizeSignal = `${showFilters}-${detailStation?.id ?? "none"}`;

  return (
    <>
      {/* Mobile search */}
      <div className="lg:hidden">
        <SearchBar onOpenFilters={onOpenFilters} />
      </div>

      {/* Map */}
      <StationMap
        stations={stations}
        onStationSelect={onStationSelect}
        resizeSignal={mapResizeSignal}
      />

      {/* Mobile bottom sheet */}
      <BottomSheet
        stations={stations}
        onStationSelect={onStationSelect}
        isLoading={isLoading}
      />

      {/* Filter sheet */}
      <FilterSheet isOpen={showFilters} onClose={onCloseFilters} />

      {/* Station detail */}
      <AnimatePresence>
        {detailStation && (
          <StationDetail station={detailStation} onBack={onCloseDetail} />
        )}
      </AnimatePresence>
    </>
  );
};

export default MapTabContent;

