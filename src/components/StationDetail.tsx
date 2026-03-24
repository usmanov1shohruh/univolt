import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Share2, Navigation, Clock, MapPin, Info, Coffee, Car, Bath, Shield, ShoppingBag, Hotel, Wifi, Users, Zap } from 'lucide-react';
import { Station, Amenity } from '@/types/station';
import { ConnectorBadge, PowerBadge } from './StationCard';
import { useApp } from '@/context/AppContext';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';

const amenityIcons: Record<Amenity, React.ElementType> = {
  cafe: Coffee, parking: Car, restroom: Bath, security: Shield,
  shopping: ShoppingBag, hotel: Hotel, wifi: Wifi, waiting_area: Users,
};

interface Props {
  station: Station;
  onBack: () => void;
}

export default function StationDetail({ station, onBack }: Props) {
  const { favorites, toggleFavorite } = useApp();
  const { t } = useI18n();
  const isFav = favorites.includes(station.id);

  const handleSave = () => {
    toggleFavorite(station.id);
    toast(isFav ? t('station.removed') : t('station.saved'), {
      duration: 2000,
      style: { background: 'hsl(220, 20%, 8%)', color: 'hsl(0,0%,96%)', border: '1px solid hsl(220, 12%, 14%)', fontSize: '13px' },
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share?.({ title: station.name, text: station.address, url: window.location.href });
    } catch {
      toast(t('station.link_copied'), { duration: 1500, style: { background: 'hsl(220, 20%, 8%)', color: 'hsl(0,0%,96%)', border: '1px solid hsl(220, 12%, 14%)', fontSize: '13px' } });
    }
  };

  const statusColors: Record<string, string> = {
    available: 'text-status-available',
    busy: 'text-status-busy',
    unknown: 'text-status-unknown',
    limited: 'text-status-limited',
  };

  const statusBg: Record<string, string> = {
    available: 'bg-status-available',
    busy: 'bg-status-busy',
    unknown: 'bg-status-unknown',
    limited: 'bg-status-limited',
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 32, stiffness: 300 }}
      className="fixed inset-0 bg-background z-[980] overflow-y-auto lg:relative lg:inset-auto"
    >
      {/* Sticky header */}
      <div className="sticky top-0 z-[981] surface-glass border-b border-border/50 px-4 py-3 safe-top flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-semibold text-[15px] truncate leading-tight">{station.name}</h1>
        </div>
        <button onClick={handleSave} className="p-2 -mr-2 rounded-lg hover:bg-muted transition-colors">
          <Heart className={`w-4 h-4 ${isFav ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
        </button>
      </div>

      <div className="px-5 py-5 space-y-5 pb-32">
        {/* Hero block */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${statusBg[station.availability_status]}`} />
            <span className={`text-[13px] font-medium ${statusColors[station.availability_status]}`}>
              {t(`status.${station.availability_status}`)}
            </span>
            <span className="text-border text-[11px]">·</span>
            <span className="text-[11px] text-muted-foreground">{station.operator}</span>
          </div>
          <p className="text-[13px] text-muted-foreground leading-relaxed">{station.address}</p>
        </div>

        {/* Quick info row */}
        <div className="flex gap-2">
          <div className="flex-1 bg-card rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-1.5 text-primary mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span className="font-display font-semibold text-sm">{station.max_power_kw}</span>
              <span className="text-[11px] text-muted-foreground">{t('station.kw')}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{t(`speed.${station.charging_speed_category}`)}</p>
          </div>
          <div className="flex-1 bg-card rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-1.5 text-foreground mb-1">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-display font-semibold text-sm">{station.is_24_7 ? '24/7' : station.hours}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{t('station.hours')}</p>
          </div>
          <div className="flex-1 bg-card rounded-lg p-3 border border-border/50">
            <div className="font-display font-semibold text-sm text-foreground mb-1">{station.ports_count}</div>
            <p className="text-[10px] text-muted-foreground">{t('station.ports')}</p>
          </div>
        </div>

        {/* Connectors */}
        <Section label={t('station.connectors')}>
          <div className="flex flex-wrap gap-1.5">
            {station.connector_types.map(ct => <ConnectorBadge key={ct} type={ct} />)}
            <PowerBadge kw={station.max_power_kw} />
          </div>
        </Section>

        {/* Pricing */}
        <Section label={t('station.pricing')}>
          <p className="text-[13px] text-foreground/90">{station.pricing_info || station.payment_info_text || t('station.check_on_site')}</p>
        </Section>

        {/* Access */}
        {station.access_notes && (
          <Section label={t('station.access')}>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{station.access_notes}</p>
          </Section>
        )}

        {/* Amenities */}
        {station.amenities.length > 0 && (
          <Section label={t('station.amenities')}>
            <div className="flex flex-wrap gap-1.5">
              {station.amenities.map(a => {
                const Icon = amenityIcons[a];
                return (
                  <span key={a} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-[11px] text-muted-foreground">
                    <Icon className="w-3 h-3" />
                    {t(`amenity.${a}`)}
                  </span>
                );
              })}
            </div>
          </Section>
        )}

        {/* How to find */}
        {station.how_to_find && (
          <Section label={t('station.how_to_find')}>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{station.how_to_find}</p>
          </Section>
        )}

        {/* Good to know */}
        {station.good_to_know && (
          <Section label={t('station.good_to_know')}>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{station.good_to_know}</p>
          </Section>
        )}

        {/* Disclaimer + meta */}
        <div className="space-y-2 pt-2">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
            <Info className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground/70 leading-relaxed">{t('disclaimer.info')}</p>
          </div>
          <div className="text-[10px] text-muted-foreground/40 space-y-0.5">
            <p>{station.last_updated_text}</p>
            {!station.is_verified && <p>⚠ {t('station.not_verified')}</p>}
          </div>
        </div>
      </div>

      {/* Sticky CTAs */}
      <div className="fixed bottom-0 left-0 right-0 surface-glass border-t border-border/50 px-5 py-4 flex gap-2.5 safe-bottom z-[981] lg:relative lg:border-0">
        <button
          onClick={() => window.open(station.route_url, '_blank')}
          className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-[14px] flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <Navigation className="w-4 h-4" />
          {t('station.route')}
        </button>
        <button onClick={handleShare} className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center transition-colors hover:bg-surface-elevated">
          <Share2 className="w-4 h-4 text-muted-foreground" />
        </button>
        <button onClick={handleSave} className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center transition-colors hover:bg-surface-elevated">
          <Heart className={`w-4 h-4 ${isFav ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
        </button>
      </div>
    </motion.div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-[11px] text-muted-foreground/70 font-medium tracking-wide">{label}</h3>
      {children}
    </div>
  );
}
