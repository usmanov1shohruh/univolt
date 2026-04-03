import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Share2, Navigation, Clock, Info, Coffee, Car, Bath, Shield, ShoppingBag, Hotel, Wifi, Users, Zap, ExternalLink } from 'lucide-react';
import { Station, Amenity } from '@/types/station';
import { ConnectorBadge, PowerBadge } from './StationCard';
import { useApp } from '@/context/AppContext';
import { useI18n } from '@/lib/i18n';
import { getNetworkAppUrl } from '@/lib/networkAppLinks';
import { getOperatorLogoLetter, getOperatorLogoUrl } from '@/lib/operatorLogos';
import { toast } from 'sonner';
import { useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { isTelegramMiniApp } from '@/telegram/webApp';

const amenityIcons: Record<Amenity, React.ElementType> = {
  cafe: Coffee, parking: Car, restroom: Bath, security: Shield,
  shopping: ShoppingBag, hotel: Hotel, wifi: Wifi, waiting_area: Users,
};

interface Props {
  station: Station;
  onBack: () => void;
}

type MapProvider = 'waze' | '2gis' | 'yandex' | 'google';

/** Order shown in the picker (Yandex / 2GIS first for this region). */
const ROUTE_PROVIDERS_ORDER: MapProvider[] = ['waze', 'yandex', '2gis', 'google'];

const mapProviderMeta: Record<MapProvider, { label: string; icon: string; iconClassName: string }> = {
  waze: {
    label: 'Waze',
    icon: 'W',
    iconClassName: 'bg-[#33CCFF] text-black',
  },
  '2gis': {
    label: '2GIS',
    icon: '2',
    iconClassName: 'bg-[#17A34A] text-white',
  },
  yandex: {
    label: 'Yandex Maps',
    icon: 'Я',
    iconClassName: 'bg-[#FC3F1D] text-white',
  },
  google: {
    label: 'Google Maps',
    icon: 'G',
    iconClassName: 'bg-[#4285F4] text-white',
  },
};

function buildRouteUrl(provider: MapProvider, station: Station): string {
  const lat = station.latitude.toFixed(6);
  const lon = station.longitude.toFixed(6);

  if (provider === 'waze') {
    return `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`;
  }

  if (provider === 'google') {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`;
  }

  if (provider === 'yandex') {
    return `https://yandex.uz/maps/?rtext=~${lat},${lon}&rtt=auto`;
  }

  return `https://2gis.uz/tashkent/routeSearch/rsType/car/to/${lon},${lat}`;
}

function openExternalLink(url: string): void {
  if (isTelegramMiniApp()) {
    try {
      WebApp.openLink(url);
      return;
    } catch {
      /* fall through */
    }
  }

  const w = window.open(url, '_blank', 'noopener,noreferrer');
  if (w) return;
  window.location.assign(url);
}

export default function StationDetail({ station, onBack }: Props) {
  const { favorites, toggleFavorite } = useApp();
  const { t } = useI18n();
  const isFav = favorites.includes(station.id);
  const logoUrl = getOperatorLogoUrl(station.operator);
  const logoLetter = getOperatorLogoLetter(station.operator);
  const [isRoutePickerOpen, setIsRoutePickerOpen] = useState(false);
  const networkAppUrl = getNetworkAppUrl(station.operator, WebApp.platform);

  const handleSave = () => {
    toggleFavorite(station.id);
    toast(isFav ? t('station.removed') : t('station.saved'), { duration: 2000 });
  };

  const handleShare = async () => {
    try {
      await navigator.share?.({ title: station.name, text: station.address, url: window.location.href });
    } catch {
      toast(t('station.link_copied'), { duration: 1500 });
    }
  };

  const handleRouteSelect = (provider: MapProvider) => {
    setIsRoutePickerOpen(false);
    openExternalLink(buildRouteUrl(provider, station));
  };

  const handleOpenNetworkApp = () => {
    if (!networkAppUrl) {
      toast(t('station.network_app_unavailable'), { duration: 2000 });
      return;
    }
    openExternalLink(networkAppUrl);
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
      className="fixed inset-0 bg-background text-foreground z-[980] overflow-y-auto lg:relative lg:inset-auto"
    >
      {/* Sticky header */}
      <div className="sticky top-0 z-[981] surface-glass border-b border-border/50 px-4 py-3 tma-top-offset flex items-center gap-3">
        <button type="button" onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors text-foreground">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-semibold text-[15px] truncate leading-tight text-foreground">{station.name}</h1>
        </div>
        <button type="button" onClick={handleSave} className="p-2 -mr-2 rounded-lg hover:bg-muted transition-colors">
          <Heart className={`w-4 h-4 ${isFav ? 'fill-primary text-primary' : 'text-foreground/55'}`} />
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
            <span className="inline-flex items-center gap-2 min-w-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt=""
                  width={18}
                  height={18}
                  className="w-[18px] h-[18px] object-cover rounded-full block shrink-0"
                  loading="eager"
                />
              ) : (
                <span className="w-5 h-5 rounded-[6px] bg-muted/60 inline-flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                  {logoLetter}
                </span>
              )}
              <span className="text-[11px] text-foreground/70 truncate">{station.operator}</span>
            </span>
          </div>
          <p className="text-[13px] text-foreground/80 leading-relaxed">{station.address}</p>
        </div>

        {/* Quick info row */}
        <div className="flex gap-2">
          <div className="flex-1 bg-card rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-1.5 text-primary mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span className="font-display font-semibold text-sm">
                {station.max_power_kw == null ? t('station.power_unknown') : station.max_power_kw}
              </span>
              {station.max_power_kw != null && (
                <span className="text-[11px] text-foreground/70">{t('station.kw')}</span>
              )}
            </div>
            <p className="text-[10px] text-foreground/70">{t(`speed.${station.charging_speed_category}`)}</p>
          </div>
          <div className="flex-1 bg-card rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-1.5 text-foreground mb-1">
              <Clock className="w-3.5 h-3.5 text-foreground/65" />
              <span className="font-display font-semibold text-sm">
                {station.is_24_7 ? '24/7' : station.hours || t('station.check_on_site')}
              </span>
            </div>
            <p className="text-[10px] text-foreground/70">{t('station.hours')}</p>
          </div>
          <div className="flex-1 bg-card rounded-lg p-3 border border-border/50">
            <div className="font-display font-semibold text-sm text-foreground mb-1">
              {station.ports_count == null ? t('station.ports_unknown') : station.ports_count}
            </div>
            <p className="text-[10px] text-foreground/70">{t('station.ports')}</p>
          </div>
        </div>

        {/* Location */}
        <Section label="Location">
          <div className="text-[13px] text-foreground/80 space-y-1">
            {station.district && (
              <p>
                <span className="text-foreground/55 text-[12px]">District: </span>
                <span>{station.district}</span>
              </p>
            )}
            <p>
              <span className="text-foreground/55 text-[12px]">Coordinates: </span>
              <span>
                {station.latitude.toFixed(6)}, {station.longitude.toFixed(6)}
              </span>
            </p>
          </div>
        </Section>

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
            <p className="text-[13px] text-foreground/78 leading-relaxed">{station.access_notes}</p>
          </Section>
        )}

        {/* Amenities */}
        {station.amenities.length > 0 && (
          <Section label={t('station.amenities')}>
            <div className="flex flex-wrap gap-1.5">
              {station.amenities.map(a => {
                const Icon = amenityIcons[a];
                return (
                  <span key={a} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-[11px] text-foreground/75">
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
            <p className="text-[13px] text-foreground/78 leading-relaxed">{station.how_to_find}</p>
          </Section>
        )}

        {/* Good to know */}
        {station.good_to_know && (
          <Section label={t('station.good_to_know')}>
            <p className="text-[13px] text-foreground/78 leading-relaxed">{station.good_to_know}</p>
          </Section>
        )}

        {/* Technical meta */}
        <Section label="Details">
          <div className="text-[11px] text-foreground/70 space-y-1.5">
            <p>
              <span className="text-foreground/50">Data source: </span>
              <span>{station.source_type}</span>
            </p>
            <p>
              <span className="text-foreground/50">Confidence: </span>
              <span>{Math.round(station.confidence_level * 100)}%</span>
            </p>
            {station.route_url && (
              <p className="truncate">
                <span className="text-foreground/50">Route URL: </span>
                <span className="break-all">{station.route_url}</span>
              </p>
            )}
          </div>
        </Section>

        {/* Disclaimer + meta */}
        <div className="space-y-2 pt-2">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
            <Info className="w-3.5 h-3.5 text-foreground/45 shrink-0 mt-0.5" />
            <p className="text-[11px] text-foreground/55 leading-relaxed">{t('disclaimer.info')}</p>
          </div>
          <div className="text-[10px] text-foreground/45 space-y-0.5">
            <p>{station.last_updated_text}</p>
            {!station.is_verified && <p>⚠ {t('station.not_verified')}</p>}
          </div>
        </div>
      </div>

      {/* Sticky CTAs */}
      <div className="fixed bottom-0 left-0 right-0 surface-glass border-t border-border/50 px-5 py-4 flex gap-2.5 safe-bottom z-[981] lg:relative lg:border-0">
        <button
          type="button"
          onClick={() => setIsRoutePickerOpen(true)}
          className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-[14px] flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <Navigation className="w-4 h-4" />
          {t('station.route')}
        </button>
        {networkAppUrl && (
          <button
            type="button"
            onClick={handleOpenNetworkApp}
            className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center transition-colors hover:bg-surface-elevated"
            aria-label={t('station.open_network_app')}
            title={t('station.open_network_app')}
          >
            <ExternalLink className="w-4 h-4 text-foreground/55" />
          </button>
        )}
        <button type="button" onClick={handleShare} className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center transition-colors hover:bg-surface-elevated">
          <Share2 className="w-4 h-4 text-foreground/55" />
        </button>
        <button type="button" onClick={handleSave} className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center transition-colors hover:bg-surface-elevated">
          <Heart className={`w-4 h-4 ${isFav ? 'fill-primary text-primary' : 'text-foreground/55'}`} />
        </button>
      </div>

      {isRoutePickerOpen && (
        <div className="fixed inset-0 z-[1100] flex flex-col justify-end pointer-events-auto" role="dialog" aria-modal="true" aria-labelledby="route-picker-title">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 border-0 cursor-default"
            aria-label={t('station.route.cancel')}
            onClick={() => setIsRoutePickerOpen(false)}
          />
          <div className="relative bg-card text-card-foreground border-t border-border rounded-t-2xl px-4 pt-3 pb-6 safe-bottom shadow-elevated max-h-[min(85dvh,560px)] overflow-y-auto">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" aria-hidden />
            <h2 id="route-picker-title" className="font-display font-semibold text-base px-0.5 mb-1 text-card-foreground">
              {t('station.route.choose')}
            </h2>
            <p className="text-sm text-card-foreground/75 px-0.5 mb-4">{t('station.route.open_in')}</p>
            <div className="grid gap-2">
              {ROUTE_PROVIDERS_ORDER.map((provider) => {
                const meta = mapProviderMeta[provider];
                return (
                  <button
                    type="button"
                    key={provider}
                    onClick={() => handleRouteSelect(provider)}
                    className="w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-left text-sm font-medium text-card-foreground flex items-center justify-between active:scale-[0.99] transition-transform"
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span className={`shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${meta.iconClassName}`}>
                        {meta.icon}
                      </span>
                      <span className="truncate text-card-foreground">{meta.label}</span>
                    </span>
                    <ExternalLink className="w-4 h-4 text-card-foreground/60 shrink-0" />
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setIsRoutePickerOpen(false)}
              className="mt-3 w-full py-3 rounded-xl border border-border text-sm font-medium text-card-foreground/80 hover:bg-muted/40 transition-colors"
            >
              {t('station.route.cancel')}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-[11px] text-foreground/60 font-medium tracking-wide">{label}</h3>
      {children}
    </div>
  );
}
