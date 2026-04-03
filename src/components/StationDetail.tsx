import { Fragment, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Navigation,
  ExternalLink,
  Zap,
  Plug,
  MapPin,
  CalendarClock,
} from 'lucide-react';
import { Station } from '@/types/station';
import { useApp } from '@/context/AppContext';
import { useI18n } from '@/lib/i18n';
import { getNetworkAppUrl } from '@/lib/networkAppLinks';
import { toast } from 'sonner';
import WebApp from '@twa-dev/sdk';
import { isTelegramMiniApp } from '@/telegram/webApp';
import { distanceKm } from '@/lib/distance';
import { ConnectorTypeIcon, sortConnectorTypesForDisplay } from '@/components/connectors/ConnectorTypeIcon';
import type { AvailabilityStatus } from '@/types/station';

interface Props {
  station: Station;
  onBack: () => void;
}

type MapProvider = 'waze' | '2gis' | 'yandex' | 'google';

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

function splitPricingLines(raw: string | undefined): { main: string; sub?: string } | null {
  const t = raw?.trim();
  if (!t) return null;
  const lines = t.split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length >= 2) return { main: lines[0], sub: lines[1] };
  return { main: lines[0] };
}

const statusPillClass: Record<AvailabilityStatus, string> = {
  available:
    'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500/25',
  busy: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 ring-1 ring-rose-500/25',
  limited: 'bg-amber-500/15 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500/25',
  unknown: 'bg-muted text-muted-foreground ring-1 ring-border/60',
};

export default function StationDetail({ station, onBack }: Props) {
  const { favorites, toggleFavorite, userGeolocation } = useApp();
  const { t, locale } = useI18n();
  const isFav = favorites.includes(station.id);
  const [isRoutePickerOpen, setIsRoutePickerOpen] = useState(false);
  const networkAppUrl = getNetworkAppUrl(station.operator, WebApp.platform);

  const distanceKmValue = useMemo(() => {
    if (!userGeolocation) return null;
    return distanceKm(
      userGeolocation.latitude,
      userGeolocation.longitude,
      station.latitude,
      station.longitude,
    );
  }, [userGeolocation, station.latitude, station.longitude]);

  const distanceLabel = useMemo(() => {
    if (distanceKmValue == null) return null;
    const locTag = locale === 'en' ? 'en-US' : locale === 'uz' ? 'uz-UZ' : 'ru-RU';
    const frac = distanceKmValue < 10 ? 2 : 1;
    const km = distanceKmValue.toLocaleString(locTag, {
      minimumFractionDigits: frac,
      maximumFractionDigits: frac,
    });
    return t('station.detail.distance_km', { km });
  }, [distanceKmValue, locale, t]);

  const addressLine = [station.address, station.district].map((s) => s?.trim()).find(Boolean) ?? '';

  const pricingBlock = splitPricingLines(station.pricing_info ?? station.payment_info_text);

  const orderedConnectors = useMemo(
    () => sortConnectorTypesForDisplay(station.connector_types),
    [station.connector_types],
  );

  const handleSave = () => {
    toggleFavorite(station.id);
    toast(isFav ? t('station.removed') : t('station.saved'), { duration: 2000 });
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

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 32, stiffness: 300 }}
      className="fixed inset-0 bg-background text-foreground z-[980] overflow-y-auto lg:relative lg:inset-auto"
    >
      <div className="sticky top-0 z-[981] surface-glass border-b border-border/50 px-4 py-3 tma-top-offset flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors text-foreground"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1" />
        <button type="button" onClick={handleSave} className="p-2 -mr-2 rounded-lg hover:bg-muted transition-colors">
          <Heart className={`w-4 h-4 ${isFav ? 'fill-primary text-primary' : 'text-foreground/55'}`} />
        </button>
      </div>

      <div className="px-5 pt-4 pb-40 space-y-5">
        <div className="flex gap-3 justify-between items-start">
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-bold text-[20px] leading-tight text-foreground">{station.name}</h1>
            {addressLine ? (
              <p className="text-[14px] text-muted-foreground mt-2 leading-snug">{addressLine}</p>
            ) : null}
          </div>
          {distanceLabel ? (
            <div className="shrink-0 inline-flex items-center gap-1 rounded-xl bg-muted/90 px-2.5 py-1.5 text-[12px] font-medium text-foreground/85 border border-border/50">
              <MapPin className="w-3.5 h-3.5 opacity-70" />
              {distanceLabel}
            </div>
          ) : null}
        </div>

        <div
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-semibold ${statusPillClass[station.availability_status]}`}
        >
          <Zap className="w-3.5 h-3.5 shrink-0" />
          {t(`status.${station.availability_status}`)}
        </div>

        <div className="flex gap-3 items-start">
          <Zap className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" strokeWidth={2} />
          <p className="text-[15px] leading-snug text-foreground">
            {station.max_power_kw != null ? (
              <>
                <span className="font-semibold">
                  {station.max_power_kw} {t('station.kw')}
                </span>
                {station.charging_speed_category !== 'unknown' ? (
                  <span className="text-muted-foreground font-normal">
                    {' '}
                    — {t(`speed.${station.charging_speed_category}`)}
                  </span>
                ) : null}
              </>
            ) : (
              <span className="text-muted-foreground">{t('station.power_unknown')}</span>
            )}
          </p>
        </div>

        {station.ports_count != null ? (
          <div className="flex gap-3 items-start">
            <Plug className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-[15px] text-foreground">
              {t('station.detail.ports_n', { n: station.ports_count })}
            </p>
          </div>
        ) : null}

        {orderedConnectors.length > 0 ? (
          <div className="flex flex-wrap items-center gap-y-2">
            {orderedConnectors.map((ct, i) => (
              <Fragment key={ct}>
                {i > 0 ? <span className="text-muted-foreground/35 px-1.5 select-none">·</span> : null}
                <ConnectorTypeIcon type={ct} />
              </Fragment>
            ))}
          </div>
        ) : null}

        {pricingBlock ? (
          <div className="pt-1">
            <p className="text-[26px] font-bold font-display tracking-tight text-foreground leading-none">
              {pricingBlock.main}
            </p>
            {pricingBlock.sub ? (
              <p className="text-[14px] text-muted-foreground mt-2">{pricingBlock.sub}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="fixed bottom-0 left-0 right-0 surface-glass border-t border-border/50 px-4 py-3.5 flex gap-2.5 safe-bottom z-[981] lg:relative lg:border-0 lg:px-5">
        <button
          type="button"
          onClick={() => setIsRoutePickerOpen(true)}
          className="flex-1 min-w-0 py-3.5 rounded-xl bg-foreground text-background font-display font-semibold text-[15px] flex items-center justify-center gap-2 transition-all hover:opacity-92 active:scale-[0.99]"
        >
          <Navigation className="w-4 h-4 shrink-0" />
          {t('station.route')}
        </button>
        {networkAppUrl ? (
          <button
            type="button"
            onClick={handleOpenNetworkApp}
            className="flex-1 min-w-0 py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-[15px] flex items-center justify-center gap-2 transition-all hover:opacity-92 active:scale-[0.99]"
          >
            <CalendarClock className="w-4 h-4 shrink-0" />
            {t('station.detail.operator_cta')}
          </button>
        ) : null}
      </div>

      {isRoutePickerOpen && (
        <div
          className="fixed inset-0 z-[1100] flex flex-col justify-end pointer-events-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="route-picker-title"
        >
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
                      <span
                        className={`shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${meta.iconClassName}`}
                      >
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
