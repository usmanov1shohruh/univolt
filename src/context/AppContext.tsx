import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Station, Filters, defaultFilters } from '@/types/station';
import { stations as allStations } from '@/data/stations';
import { filterStations, countActiveFilters } from "@/domain/stations/filtering";
import { loadFavorites, saveFavorites } from "@/infra/storage/favoritesStorage";
import { loadOnboardingSeen, saveOnboardingSeen } from "@/infra/storage/onboardingStorage";
import { loadHasSelectedLanguage, saveLanguageSelected } from "@/infra/storage/languageFlagsStorage";

interface AppState {
  stations: Station[];
  filteredStations: Station[];
  selectedStation: Station | null;
  favorites: string[];
  filters: Filters;
  searchQuery: string;
  hasSeenOnboarding: boolean;
  hasSelectedLanguage: boolean;
  isLoading: boolean;
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
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => loadOnboardingSeen());
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(() => loadHasSelectedLanguage());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { const t = setTimeout(() => setIsLoading(false), 1200); return () => clearTimeout(t); }, []);
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

  const filteredStations = filterStations(allStations, filters, searchQuery);

  return (
    <AppContext.Provider value={{
      stations: allStations,
      filteredStations,
      selectedStation,
      favorites,
      filters,
      searchQuery,
      hasSeenOnboarding,
      hasSelectedLanguage,
      isLoading,
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
