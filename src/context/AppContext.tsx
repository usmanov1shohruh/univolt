import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { Station, Filters, defaultFilters } from '@/types/station';
import { filterStations, countActiveFilters } from "@/domain/stations/filtering";
import { loadFavorites, saveFavorites } from "@/infra/storage/favoritesStorage";
import { loadOnboardingSeen, saveOnboardingSeen } from "@/infra/storage/onboardingStorage";
import { loadHasSelectedLanguage, saveLanguageSelected } from "@/infra/storage/languageFlagsStorage";
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { buildStationsQueryParams, fetchStationsFromApi } from '@/infra/api/stationsApi';
import { useI18n } from '@/lib/i18n';

/** Last known device location from the map layer (for distance in station detail). */
export interface UserGeoPoint {
  latitude: number;
  longitude: number;
}

interface AppState {
  stations: Station[];
  filteredStations: Station[];
  selectedStation: Station | null;
  favorites: string[];
  filters: Filters;
  searchQuery: string;
  stationsTotal: number;
  hasSeenOnboarding: boolean;
  hasSelectedLanguage: boolean;
  isLoading: boolean;
  /** Updated while the map tracks geolocation; used in station detail for distance. */
  userGeolocation: UserGeoPoint | null;
  setUserGeolocation: (p: UserGeoPoint | null) => void;
  setSelectedStation: (s: Station | null) => void;
  toggleFavorite: (id: string) => void;
  setFilters: (f: Filters) => void;
  setSearchQuery: (q: string) => void;
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
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => loadOnboardingSeen());
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(() => loadHasSelectedLanguage());
  const [isLoading, setIsLoading] = useState(true);
  const [userGeolocation, setUserGeolocation] = useState<UserGeoPoint | null>(null);
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
    () => buildStationsQueryParams(localFilters, searchQuery),
    [localFilters, searchQuery],
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
      stationsTotal,
      hasSeenOnboarding,
      hasSelectedLanguage,
      isLoading,
      userGeolocation,
      setUserGeolocation,
      setSelectedStation,
      toggleFavorite,
      setFilters,
      setSearchQuery,
      completeOnboarding,
      completeLanguageSelection,
      activeFiltersCount: countActiveFilters(filters),
    }}>
      {children}
    </AppContext.Provider>
  );
}
