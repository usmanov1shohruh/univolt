import { useQuery } from "@tanstack/react-query";
import type { Station } from "@/types/station";
import { fetchStations } from "@/api/stationsApi";

const STATIONS_QUERY_KEY = ["stations"];

export function useStationsQuery() {
  return useQuery<Station[]>({
    queryKey: STATIONS_QUERY_KEY,
    queryFn: fetchStations,
    staleTime: 1000 * 60, // 1 minute
  });
}

