import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { Locale, useI18n } from '@/lib/i18n';

const languages: { id: Locale; name: string; native: string }[] = [
  { id: 'ru', name: 'Русский', native: 'RU' },
  { id: 'en', name: 'English', native: 'EN' },
  { id: 'uz', name: 'O\'zbekcha', native: 'UZ' },
];

const ctaLabels: Record<Locale, string> = {
  ru: 'Продолжить',
  en: 'Continue',
  uz: 'Davom etish',
};

const headlines: Record<Locale, { title: string; subtitle: string }> = {
  ru: {
    title: 'Выберите язык',
    subtitle: 'UniVolt — приложение для водителей электромобилей в Узбекистане',
  },
  en: {
    title: 'Choose your language',
    subtitle: 'UniVolt is built for EV drivers across Uzbekistan',
  },
  uz: {
    title: 'Tilni tanlang',
    subtitle: 'UniVolt — O\'zbekistondagi elektromobil haydovchilari uchun ilova',
  },
};

interface Props {
  onComplete: () => void;
}

export default function LanguageSelectScreen({ onComplete }: Props) {
  const { locale, setLocale } = useI18n();
  const [selected, setSelected] = useState<Locale>(locale);

  const handleContinue = () => {
    setLocale(selected);
    onComplete();
  };

  const content = headlines[selected];

  return (
    <div className="fixed inset-0 bg-background flex flex-col z-50 overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, hsl(190 100% 50%), transparent 65%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-[200px] opacity-[0.03]"
          style={{ background: 'linear-gradient(to top, hsl(190 100% 50%), transparent)' }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 max-w-[380px] mx-auto w-full">
        {/* Logo block */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 flex flex-col items-center"
        >
          <div className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center mb-4 relative"
            style={{ background: 'linear-gradient(135deg, hsl(190 100% 50% / 0.12), hsl(190 100% 50% / 0.04))' }}>
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none" className="text-primary">
              <path d="M22 4L8 24h10l-2 12 14-20H20l2-12z" fill="currentColor" />
            </svg>
          </div>
          <span className="font-display text-lg font-semibold text-foreground tracking-tight">UniVolt</span>
        </motion.div>

        {/* Title + subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-center mb-10"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="font-display text-[24px] font-semibold text-foreground mb-2.5 leading-[1.2] tracking-tight">
                {content.title}
              </h2>
              <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[300px] mx-auto">
                {content.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Language options */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full space-y-2"
        >
          {languages.map((lang, index) => {
            const isSelected = selected === lang.id;
            return (
              <motion.button
                key={lang.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 + index * 0.06 }}
                onClick={() => setSelected(lang.id)}
                className={`w-full flex items-center gap-4 px-5 py-[18px] rounded-[14px] border transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary/[0.06] border-primary/25'
                    : 'bg-card/60 border-border/40 hover:bg-card hover:border-border/60 active:scale-[0.99]'
                }`}
              >
                <span className={`text-[10px] font-mono tracking-widest w-5 ${
                  isSelected ? 'text-primary/80' : 'text-muted-foreground/40'
                }`}>
                  {lang.native}
                </span>
                <span className={`flex-1 text-left text-[15px] font-display font-medium tracking-tight ${
                  isSelected ? 'text-foreground' : 'text-foreground/70'
                }`}>
                  {lang.name}
                </span>
                <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200 ${
                  isSelected
                    ? 'border-primary bg-primary scale-100'
                    : 'border-border/60 scale-90'
                }`}>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 400 }}
                    >
                      <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="px-6 pb-8 safe-bottom max-w-[380px] mx-auto w-full"
      >
        <button
          onClick={handleContinue}
          className="w-full py-[14px] rounded-[14px] bg-primary text-primary-foreground font-display font-semibold text-[15px] tracking-tight transition-all hover:opacity-90 active:scale-[0.98] glow-primary-subtle"
        >
          {ctaLabels[selected]}
        </button>
      </motion.div>
    </div>
  );
}
