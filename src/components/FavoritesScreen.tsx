import { useApp } from '@/context/AppContext';
import { useI18n } from '@/lib/i18n';
import StationCard from './StationCard';
import { Station } from '@/types/station';
import { Heart } from 'lucide-react';

interface Props {
  onStationSelect: (s: Station) => void;
}

export default function FavoritesScreen({ onStationSelect }: Props) {
  const { stations, favorites } = useApp();
  const { t } = useI18n();
  const favStations = stations.filter(s => favorites.includes(s.id));

  return (
    <div className="min-h-screen bg-background px-4 pt-14 pb-24">
      <h1 className="font-display text-lg font-semibold mb-5">{t('favorites.title')}</h1>
      {favStations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <p className="text-foreground/80 font-display font-medium text-[14px] mb-1">{t('favorites.empty')}</p>
          <p className="text-[12px] text-muted-foreground">{t('favorites.empty.subtitle')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {favStations.map(s => <StationCard key={s.id} station={s} onSelect={onStationSelect} />)}
        </div>
      )}
    </div>
  );
}
