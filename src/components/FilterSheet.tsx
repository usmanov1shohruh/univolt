import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useI18n } from '@/lib/i18n';
import { Filters, ConnectorType, ChargingSpeed, AvailabilityStatus, ParkingType, defaultFilters } from '@/types/station';

const CONNECTOR_OPTIONS: ConnectorType[] = ['CCS2', 'GB/T', 'Type2', 'CHAdeMO', 'J1772'];
const SPEED_OPTIONS: ChargingSpeed[] = ['slow_ac', 'medium', 'fast_dc', 'ultra_fast'];
const STATUS_OPTIONS: AvailabilityStatus[] = ['available', 'busy', 'unknown', 'limited'];
const PARKING_OPTIONS: ParkingType[] = ['mall', 'hotel', 'business_center', 'residential', 'standalone', 'gas_station'];

function ChipToggle<T extends string>({ options, selected, onToggle, labelFn }: {
  options: T[]; selected: T[]; onToggle: (v: T) => void; labelFn: (v: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onToggle(opt)}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 ${
            selected.includes(opt)
              ? 'bg-primary/15 text-primary border border-primary/30'
              : 'bg-muted text-muted-foreground border border-transparent hover:text-foreground'
          }`}
        >
          {labelFn(opt)}
        </button>
      ))}
    </div>
  );
}

interface Props { isOpen: boolean; onClose: () => void; }

export default function FilterSheet({ isOpen, onClose }: Props) {
  const { filters, setFilters, stations } = useApp();
  const { t } = useI18n();
  const [local, setLocal] = useState<Filters>(filters);

  const toggle = <T extends string>(key: keyof Filters, value: T) => {
    setLocal(prev => {
      const arr = prev[key] as T[];
      return { ...prev, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  };

  const apply = () => { setFilters(local); onClose(); };
  const reset = () => { setLocal(defaultFilters); setFilters(defaultFilters); };

  const operators = [...new Set(stations.map(s => s.operator))].sort((a, b) => a.localeCompare(b));
  const districts = [...new Set(stations.map(s => s.district).filter(Boolean))].sort((a, b) => a.localeCompare(b));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/70 backdrop-blur-sm z-[960]" onClick={onClose} />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            className="fixed left-0 right-0 bottom-0 bg-background rounded-t-2xl border-t border-border/50 z-[970] max-h-[82vh] flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="font-display font-semibold text-base">{t('filter.title')}</h2>
              <button onClick={onClose} className="p-2 -mr-2 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-5">
              <FilterSection label={t('filter.connector_type')}>
                <ChipToggle options={CONNECTOR_OPTIONS} selected={local.connector_types} onToggle={v => toggle('connector_types', v)} labelFn={v => v} />
              </FilterSection>
              <FilterSection label={t('filter.charging_speed')}>
                <ChipToggle options={SPEED_OPTIONS} selected={local.charging_speeds} onToggle={v => toggle('charging_speeds', v)} labelFn={v => t(`speed.${v}`)} />
              </FilterSection>
              <FilterSection label={t('filter.availability')}>
                <ChipToggle options={STATUS_OPTIONS} selected={local.availability} onToggle={v => toggle('availability', v)} labelFn={v => t(`status.${v}`)} />
              </FilterSection>
              <FilterSection label={t('filter.24_7')}>
                <div className="flex gap-1.5">
                  {[true, false].map(val => (
                    <button key={String(val)} onClick={() => setLocal(p => ({ ...p, is_24_7: p.is_24_7 === val ? null : val }))}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                        local.is_24_7 === val ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted text-muted-foreground border border-transparent'
                      }`}>
                      {val ? t('filter.24_7.yes') : t('filter.24_7.no')}
                    </button>
                  ))}
                </div>
              </FilterSection>
              <FilterSection label={t('filter.parking_type')}>
                <ChipToggle options={PARKING_OPTIONS} selected={local.parking_types} onToggle={v => toggle('parking_types', v)} labelFn={v => t(`parking.${v}`)} />
              </FilterSection>
              <FilterSection label={t('filter.operator')}>
                <ChipToggle options={operators} selected={local.operators} onToggle={v => toggle('operators', v)} labelFn={v => v} />
              </FilterSection>
              <FilterSection label={t('filter.district')}>
                <ChipToggle options={districts} selected={local.districts} onToggle={v => toggle('districts', v)} labelFn={v => v} />
              </FilterSection>
            </div>

            <div className="px-5 py-4 border-t border-border/50 flex gap-2.5 safe-bottom">
              <button onClick={reset} className="flex-1 py-3 rounded-xl bg-muted text-foreground font-display font-medium text-[13px] transition-colors hover:bg-surface-elevated">
                {t('filter.reset')}
              </button>
              <button onClick={apply} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-display font-medium text-[13px] transition-all hover:opacity-90">
                {t('filter.apply')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] text-muted-foreground/70 font-medium tracking-wide mb-2.5">{label}</h3>
      {children}
    </div>
  );
}
