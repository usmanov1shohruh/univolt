import { useI18n, Locale } from '@/lib/i18n';
import {
  Calendar,
  Check,
  CreditCard,
  Globe,
  Info,
  MapPin,
  Monitor,
  Moon,
  Sun,
  Zap,
} from 'lucide-react';
import { useAppTheme } from '@/theme/ThemeProvider';
import type { ThemeMode } from '@/theme/types';

const languages: { id: Locale; name: string; native: string }[] = [
  { id: 'ru', name: 'Русский', native: 'RU' },
  { id: 'en', name: 'English', native: 'EN' },
  { id: 'uz', name: 'O\'zbekcha', native: 'UZ' },
];

const comingSoon = [
  { icon: Zap, label: 'settings.coming.live' },
  { icon: CreditCard, label: 'settings.coming.wallet' },
  { icon: Calendar, label: 'settings.coming.booking' },
  { icon: MapPin, label: 'settings.coming.routes' },
];

const themeOptions: { id: ThemeMode; icon: typeof Monitor; labelKey: string }[] = [
  { id: 'system', icon: Monitor, labelKey: 'settings.theme.system' },
  { id: 'light', icon: Sun, labelKey: 'settings.theme.light' },
  { id: 'dark', icon: Moon, labelKey: 'settings.theme.dark' },
];

export default function SettingsScreen() {
  const { locale, setLocale, t } = useI18n();
  const { themeMode, setThemeMode } = useAppTheme();

  return (
    <div className="min-h-screen bg-background px-5 pt-14 pb-24">
      <h1 className="font-display text-lg font-semibold mb-6">{t('settings.title')}</h1>

      {/* Appearance */}
      <section className="mb-7">
        <h3 className="text-[11px] text-muted-foreground/70 font-medium tracking-wide mb-2.5 flex items-center gap-1.5">
          <Sun className="w-3 h-3" />
          {t('settings.appearance')}
        </h3>
        <div className="bg-card rounded-xl border border-border/50 p-1 flex gap-1">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const active = themeMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setThemeMode(opt.id)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-[10px] text-[11px] font-medium transition-all ${
                  active
                    ? 'bg-primary/12 text-foreground ring-1 ring-primary/35 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] ${active ? 'text-primary' : 'opacity-80'}`} strokeWidth={active ? 2 : 1.5} />
                <span className="leading-tight text-center">{t(opt.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Language */}
      <section className="mb-7">
        <h3 className="text-[11px] text-muted-foreground/70 font-medium tracking-wide mb-2.5 flex items-center gap-1.5">
          <Globe className="w-3 h-3" />
          {t('settings.language')}
        </h3>
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
          {languages.map((lang, i) => (
            <button
              key={lang.id}
              onClick={() => setLocale(lang.id)}
              className={`w-full flex items-center justify-between px-4 py-3 text-[13px] transition-colors ${
                i < languages.length - 1 ? 'border-b border-border/30' : ''
              } ${locale === lang.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-muted-foreground/50 w-5">{lang.native}</span>
                <span>{lang.name}</span>
              </div>
              {locale === lang.id && <Check className="w-3.5 h-3.5 text-primary" />}
            </button>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="mb-7">
        <h3 className="text-[11px] text-muted-foreground/70 font-medium tracking-wide mb-2.5 flex items-center gap-1.5">
          <Info className="w-3 h-3" />
          {t('settings.about')}
        </h3>
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-brand-panel">
              <svg width="18" height="18" viewBox="0 0 40 40" fill="none" className="text-primary">
                <path d="M22 4L8 24h10l-2 12 14-20H20l2-12z" fill="currentColor" />
              </svg>
            </div>
            <div>
              <p className="font-display font-semibold text-[13px]">UniVolt</p>
              <p className="text-[10px] text-muted-foreground/50">v1.0.0</p>
            </div>
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed">{t('settings.about.text')}</p>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="mb-7">
        <div className="bg-muted/50 rounded-xl p-3.5 flex items-start gap-2.5">
          <Info className="w-3.5 h-3.5 text-status-limited/60 shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground/60 leading-relaxed">{t('settings.disclaimer')}</p>
        </div>
      </section>

      {/* Coming Soon */}
      <section>
        <h3 className="text-[11px] text-muted-foreground/70 font-medium tracking-wide mb-2.5">
          {t('settings.coming_soon')}
        </h3>
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
          {comingSoon.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={`flex items-center gap-3 px-4 py-3 ${i < comingSoon.length - 1 ? 'border-b border-border/30' : ''}`}>
                <Icon className="w-3.5 h-3.5 text-muted-foreground/40" />
                <span className="flex-1 text-[13px] text-muted-foreground">{t(item.label)}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/8 text-primary/70 font-medium tracking-wide">SOON</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
