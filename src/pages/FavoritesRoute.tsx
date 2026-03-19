import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import type { Station } from "@/types/station";
import FavoritesTabContent from "@/pages/FavoritesTabContent";

export default function FavoritesRoute() {
  const navigate = useNavigate();
  const { setSelectedStation } = useApp();

  const handleStationSelect = (station: Station) => {
    setSelectedStation(station);
    navigate({ pathname: "/", search: `?station=${encodeURIComponent(station.id)}` });
  };

  return <FavoritesTabContent onStationSelect={handleStationSelect} />;
}

