import { Station, AvailabilityStatus, ConnectorType } from '@/types/station';
import { useI18n } from '@/lib/i18n';
import { Zap, Clock, MapPin, Heart, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getOperatorLogoLetter, getOperatorLogoUrl } from '@/lib/operatorLogos';

function StatusDot({ status }: { status: AvailabilityStatus }) {
  const colors: Record<AvailabilityStatus, string> = {
    available: 'bg-status-available',
    busy: 'bg-status-busy',
    unknown: 'bg-status-unknown',
    limited: 'bg-status-limited',
  };
  return <span className={`w-1.5 h-1.5 rounded-full ${colors[status]} shrink-0`} />;
}

function StatusLabel({ status }: { status: AvailabilityStatus }) {
  const { t } = useI18n();
  const colors: Record<AvailabilityStatus, string> = {
    available: 'text-status-available',
    busy: 'text-status-busy',
    unknown: 'text-status-unknown',
    limited: 'text-status-limited',
  };
  return (
    <span className={`text-[11px] font-medium ${colors[status]} flex items-center gap-1.5`}>
      <StatusDot status={status} />
      {t(`status.${status}`)}
    </span>
  );
}

export function ConnectorBadge({ type }: { type: ConnectorType }) {
  return (
    <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-secondary-foreground">
      {type}
    </span>
  );
}

export function PowerBadge({ kw }: { kw: number | null }) {
  const { t } = useI18n();
  if (kw == null) {
    return (
      <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-muted-foreground flex items-center gap-1">
        <Zap className="w-2.5 h-2.5 opacity-60" />
        {t('station.power_unknown')}
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-md bg-primary/8 text-[11px] font-medium text-primary flex items-center gap-1">
      <Zap className="w-2.5 h-2.5" />
      {kw} {t('station.kw')}
    </span>
  );
}

interface StationCardProps {
  station: Station;
  onSelect: (s: Station) => void;
  compact?: boolean;
}

export default function StationCard({ station, onSelect, compact }: StationCardProps) {
  const { favorites, toggleFavorite } = useApp();
  const { t } = useI18n();
  const isFav = favorites.includes(station.id);
  const logoUrl = getOperatorLogoUrl(station.operator);
  const logoLetter = getOperatorLogoLetter(station.operator);

  return (
    <div
      onClick={() => onSelect(station)}
      className="group bg-card rounded-xl p-3.5 border border-border/60 cursor-pointer transition-all duration-200 hover:bg-card-elevated hover:border-border active:scale-[0.99] shadow-card"
    >
      {/* Row 1: name + status */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-[13px] text-foreground truncate leading-tight">
            {station.name}
          </h3>
        </div>
        <StatusLabel status={station.availability_status} />
      </div>

      {/* Row 2: operator + address */}
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-3">
        <span className="inline-flex items-center gap-2 shrink-0 min-w-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              width={14}
              height={14}
              className="w-[14px] h-[14px] object-contain block"
              loading="eager"
            />
          ) : (
            <span className="w-[14px] h-[14px] rounded-[6px] bg-muted/60 inline-flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
              {logoLetter}
            </span>
          )}
          <span className="truncate">{station.operator}</span>
        </span>
        <span className="text-border">·</span>
        <span className="truncate">{station.address}</span>
      </div>

      {!compact && (
        <>
          {/* Row 3: badges */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            {station.connector_types.slice(0, 3).map(ct => (
              <ConnectorBadge key={ct} type={ct} />
            ))}
            {station.connector_types.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{station.connector_types.length - 3}</span>
            )}
            <PowerBadge kw={station.max_power_kw} />
          </div>

          {/* Row 4: meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {station.is_24_7 ? '24/7' : station.hours || t('station.check_on_site')}
              </span>
              <span>
                {station.ports_count == null ? t('station.ports_unknown') : `${station.ports_count} ${t('station.ports')}`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(station.id); }}
                className="p-1.5 -m-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-border group-hover:text-muted-foreground transition-colors" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function StationCardSkeleton() {
  return (
    <div className="bg-card rounded-xl p-3.5 border border-border/60 animate-pulse shadow-card">
      <div className="flex justify-between items-start mb-2">
        <div className="h-3.5 bg-muted rounded w-2/3" />
        <div className="h-3 w-14 bg-muted rounded" />
      </div>
      <div className="h-2.5 bg-muted rounded w-full mt-2.5 mb-3" />
      <div className="flex gap-1.5 mb-3">
        <div className="h-5 w-10 bg-muted rounded-md" />
        <div className="h-5 w-12 bg-muted rounded-md" />
        <div className="h-5 w-14 bg-muted rounded-md" />
      </div>
      <div className="flex justify-between">
        <div className="h-2.5 w-20 bg-muted rounded" />
        <div className="h-2.5 w-10 bg-muted rounded" />
      </div>
    </div>
  );
}
