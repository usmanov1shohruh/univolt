import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useI18n } from '@/lib/i18n';

interface Props {
  onOpenFilters: () => void;
}

export default function SearchBar({ onOpenFilters }: Props) {
  const { searchQuery, setSearchQuery, activeFiltersCount } = useApp();
  const { t } = useI18n();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="absolute left-4 right-4 z-[900] flex gap-2 pointer-events-none safe-top" style={{ top: 8 }}>
      <div className={`flex-1 flex items-center surface-glass rounded-xl border transition-all duration-200 px-3.5 shadow-elevated pointer-events-auto ${
        isFocused ? 'border-primary/40' : 'border-border/40'
      }`}>
        <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={t('search.placeholder')}
          className="flex-1 bg-transparent py-3 px-2.5 text-[13px] text-foreground placeholder:text-muted-foreground outline-none font-body"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="p-1 rounded hover:bg-muted transition-colors">
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        )}
      </div>
      <button
        onClick={onOpenFilters}
        className="w-[46px] h-[46px] surface-glass rounded-xl border border-border/40 flex items-center justify-center relative shadow-elevated transition-colors hover:bg-card-elevated pointer-events-auto"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-foreground" />
        {activeFiltersCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full text-[8px] font-bold text-primary-foreground flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>
    </div>
  );
}
