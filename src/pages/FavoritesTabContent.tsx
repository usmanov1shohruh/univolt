import { Station } from "@/types/station";
import { FavoritesScreen } from "@/features/favorites";

interface FavoritesTabContentProps {
  onStationSelect: (station: Station) => void;
}

const FavoritesTabContent = ({ onStationSelect }: FavoritesTabContentProps) => {
  return <FavoritesScreen onStationSelect={onStationSelect} />;
};

export default FavoritesTabContent;

