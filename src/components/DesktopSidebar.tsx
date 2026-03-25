import { Station } from '@/types/station';
import StationCard, { StationCardSkeleton } from './StationCard';
import { useApp } from '@/context/AppContext';
import { useI18n } from '@/lib/i18n';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface Props {
  stations: Station[];
  onStationSelect: (s: Station) => void;
  onOpenFilters: () => void;
  isLoading: boolean;
}

export default function DesktopSidebar({ stations, onStationSelect, onOpenFilters, isLoading }: Props) {
  const { searchQuery, setSearchQuery, activeFiltersCount } = useApp();
  const { t } = useI18n();

  return (
    <div className="hidden lg:flex flex-col w-[400px] h-screen bg-background shrink-0 border-r border-border/50">
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-panel">
          <svg width="16" height="16" viewBox="0 0 40 40" fill="none" className="text-primary">
            <path d="M22 4L8 24h10l-2 12 14-20H20l2-12z" fill="currentColor" />
          </svg>
        </div>
        <div>
          <h1 className="font-display font-semibold text-sm text-foreground">UniVolt</h1>
          <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{t('app.tagline')}</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-3 flex gap-2">
        <div className="flex-1 flex items-center bg-muted rounded-lg px-3 transition-colors focus-within:ring-1 focus-within:ring-primary/30">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="flex-1 bg-transparent py-2.5 px-2 text-[13px] text-foreground placeholder:text-muted-foreground outline-none font-body"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-0.5 rounded hover:bg-border transition-colors">
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
        <button onClick={onOpenFilters}
          className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center relative transition-colors hover:bg-surface-elevated">
          <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full text-[8px] font-bold text-primary-foreground flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Count */}
      <div className="px-5 pb-2 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{stations.length} {t('filter.results')}</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => <StationCardSkeleton key={i} />) :
          stations.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-[13px]">{t('station.no_results')}</p>
            </div>
          ) : stations.map(s => <StationCard key={s.id} station={s} onSelect={onStationSelect} />)
        }
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground/60">{t('disclaimer.info')}</p>
      </div>
    </div>
  );
}
