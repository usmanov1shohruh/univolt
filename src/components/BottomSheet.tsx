import { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Station } from '@/types/station';
import StationCard, { StationCardSkeleton } from './StationCard';
import { useI18n } from '@/lib/i18n';

interface Props {
  stations: Station[];
  onStationSelect: (s: Station) => void;
  isLoading: boolean;
}

type SheetState = 'peek' | 'half' | 'full';

export default function BottomSheet({ stations, onStationSelect, isLoading }: Props) {
  const [sheetState, setSheetState] = useState<SheetState>('peek');
  const { t } = useI18n();

  const snapPoints: Record<SheetState, string> = {
    peek: 'calc(100% - 160px)',
    half: '45%',
    full: '56px',
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const vy = info.velocity.y;
    const dy = info.offset.y;
    if (vy > 300 || dy > 80) {
      if (sheetState === 'full') setSheetState('half');
      else if (sheetState === 'half') setSheetState('peek');
    } else if (vy < -300 || dy < -80) {
      if (sheetState === 'peek') setSheetState('half');
      else if (sheetState === 'half') setSheetState('full');
    }
  };

  return (
    <motion.div
      className="fixed left-0 right-0 bottom-0 bg-background rounded-t-2xl border-t border-border/50 z-[930] flex flex-col lg:hidden shadow-elevated"
      style={{ maxHeight: 'calc(100vh - 56px)' }}
      animate={{ top: snapPoints[sheetState] }}
      transition={{ type: 'spring', damping: 32, stiffness: 300 }}
      drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.08}
      onDragEnd={handleDragEnd}
    >
      {/* Handle */}
      <div className="flex justify-center py-3 cursor-grab active:cursor-grabbing">
        <div className="w-8 h-[3px] rounded-full bg-border" />
      </div>

      {/* Header */}
      <div className="px-5 pb-2.5">
        <span className="text-[11px] text-muted-foreground">
          {stations.length} {t('filter.results')}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StationCardSkeleton key={i} />)
        ) : stations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-[13px]">{t('station.no_results')}</p>
          </div>
        ) : (
          stations.map(s => <StationCard key={s.id} station={s} onSelect={onStationSelect} />)
        )}
      </div>
    </motion.div>
  );
}
