import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { Station, Filters, defaultFilters } from '@/types/station';
import { filterStations, countActiveFilters } from "@/domain/stations/filtering";
import { loadFavorites, saveFavorites } from "@/infra/storage/favoritesStorage";
import { loadOnboardingSeen, saveOnboardingSeen } from "@/infra/storage/onboardingStorage";
import { loadHasSelectedLanguage, saveLanguageSelected } from "@/infra/storage/languageFlagsStorage";
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { buildStationsQueryParams, fetchStationsFromApi, type MapBBox } from '@/infra/api/stationsApi';
import { useI18n } from '@/lib/i18n';

interface AppState {
  stations: Station[];
  filteredStations: Station[];
  selectedStation: Station | null;
  favorites: string[];
  filters: Filters;
  searchQuery: string;
  mapBbox: MapBBox | null;
  stationsTotal: number;
  hasSeenOnboarding: boolean;
  hasSelectedLanguage: boolean;
  isLoading: boolean;
  setSelectedStation: (s: Station | null) => void;
  toggleFavorite: (id: string) => void;
  setFilters: (f: Filters) => void;
  setSearchQuery: (q: string) => void;
  setMapBbox: (bbox: MapBBox | null) => void;
  completeOnboarding: () => void;
  completeLanguageSelection: () => void;
  activeFiltersCount: number;
}

const AppContext = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapBbox, setMapBbox] = useState<MapBBox | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => loadOnboardingSeen());
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(() => loadHasSelectedLanguage());
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { saveFavorites(favorites); }, [favorites]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  }, []);

  const completeOnboarding = useCallback(() => {
    saveOnboardingSeen();
    setHasSeenOnboarding(true);
  }, []);

  const completeLanguageSelection = useCallback(() => {
    saveLanguageSelected();
    setHasSelectedLanguage(true);
  }, []);

  // Split filters by where they matter:
  // - `remoteQueryParams` affects the HTTP request (backend filtering)
  // - `filters` are applied locally for the final result set
  const localFilters = filters;
  const remoteQueryParams = useMemo(
    () => buildStationsQueryParams(localFilters, searchQuery, mapBbox),
    [localFilters, searchQuery, mapBbox],
  );

  const {
    data: stationsPage,
    isLoading: isStationsLoading,
    isError: isStationsError,
    error: stationsError,
  } = useQuery({
    queryKey: ['stations', remoteQueryParams],
    queryFn: () => fetchStationsFromApi(remoteQueryParams),
    retry: 2,
  });

  const apiStations = stationsPage?.items ?? [];
  const stationsTotal = stationsPage?.total ?? 0;

  useEffect(() => {
    setIsLoading(isStationsLoading);
  }, [isStationsLoading]);

  useEffect(() => {
    if (!isStationsError) return;
    console.error('[stations]', stationsError);
    toast.error(t('station.load_error'));
  }, [isStationsError, stationsError, t]);

  const filteredStations = filterStations(apiStations, localFilters, searchQuery);

  return (
    <AppContext.Provider value={{
      stations: apiStations,
      filteredStations,
      selectedStation,
      favorites,
      filters,
      searchQuery,
      mapBbox,
      stationsTotal,
      hasSeenOnboarding,
      hasSelectedLanguage,
      isLoading,
      setSelectedStation,
      toggleFavorite,
      setFilters,
      setSearchQuery,
      setMapBbox,
      completeOnboarding,
      completeLanguageSelection,
      activeFiltersCount: countActiveFilters(filters),
    }}>
      {children}
    </AppContext.Provider>
  );
}
