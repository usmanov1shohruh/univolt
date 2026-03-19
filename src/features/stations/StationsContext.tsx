import { createContext, useContext } from "react";
import type { Station, Filters } from "@/types/station";

export interface StationsState {
  stations: Station[];
  filteredStations: Station[];
  filters: Filters;
  searchQuery: string;
  isLoading: boolean;
}

// Placeholder for future implementation using useStationsQuery and local state.
// Currently we reuse AppContext as the single source of truth, so this context
// is not yet wired and serves as a scaffold for future migration.

export const StationsContext = createContext<StationsState | null>(null);

export function useStations() {
  const ctx = useContext(StationsContext);
  if (!ctx) {
    throw new Error("useStations must be used within StationsContext.Provider");
  }
  return ctx;
}

