import type { Station } from "@/types/station";
import { stations } from "@/data/stations";

export async function fetchStations(): Promise<Station[]> {
  // Temporary implementation: return static data.
  // This can be replaced with a real HTTP request later.
  return Promise.resolve(stations);
}

