import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { useApp } from '@/context/AppContext';
import { ChevronLeft, MapPin, Zap, Wallet, Network } from 'lucide-react';
import onboarding1 from '@/assets/onboarding-1.jpg';
import onboarding2 from '@/assets/onboarding-2.jpg';
import onboarding3 from '@/assets/onboarding-3.jpg';
import onboarding4 from '@/assets/onboarding-4.jpg';

const slides = [
  { key: '1', image: onboarding1 },
  { key: '2', image: onboarding2 },
  { key: '3', image: onboarding3 },
  { key: '4', image: onboarding4 },
];

const SWIPE_THRESHOLD = 50;

/* ── Floating proof chips for Screen 1 ── */
function AggregationProof() {
  const { t } = useI18n();
  const operators = ['ParknCharge', 'EcoCharge', 'Hayt Energy', 'UCELL Power'];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="mt-5 flex flex-wrap gap-2"
    >
      {operators.map((op, i) => (
        <motion.span
          key={op}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 + i * 0.08 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border/40 text-[11px] text-muted-foreground font-medium"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
          {op}
        </motion.span>
      ))}
    </motion.div>
  );
}

/* ── Decision metrics for Screen 2 ── */
function DecisionMetrics() {
  const metrics = [
    { icon: Zap, value: '22–120', unit: 'kW', color: 'text-primary' },
    { icon: MapPin, value: '30+', unit: '', color: 'text-status-available' },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="mt-5 flex gap-3"
    >
      {metrics.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 + i * 0.1 }}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-card border border-border/40"
        >
          <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
          <div className="flex items-baseline gap-1">
            <span className="text-[15px] font-display font-semibold text-foreground tracking-tight">{m.value}</span>
            {m.unit && <span className="text-[10px] text-muted-foreground font-medium">{m.unit}</span>}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ── Roadmap modules for Screen 3 ── */
function RoadmapModules() {
  const { t } = useI18n();
  const modules = [
    { icon: Wallet, label: t('onboarding.roadmap.wallet') || 'Единый кошелёк' },
    { icon: Zap, label: t('onboarding.roadmap.session') || 'Запуск сессии' },
    { icon: Network, label: t('onboarding.roadmap.networks') || 'Все сети' },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="mt-5 space-y-2"
    >
      {modules.map((mod, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 + i * 0.1, duration: 0.4 }}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-card/60 border border-border/30"
        >
          <div className="w-7 h-7 rounded-lg bg-status-limited/10 flex items-center justify-center">
            <mod.icon className="w-3.5 h-3.5 text-status-limited" />
          </div>
          <span className="text-[12.5px] text-foreground/80 font-medium">{mod.label}</span>
          <div className="ml-auto">
            <div className="relative">
              <div className="w-1.5 h-1.5 rounded-full bg-status-limited" />
              <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-status-limited animate-ping opacity-30" />
            </div>
          </div>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-center gap-2 pt-1"
      >
        <div className="w-2 h-2 rounded-full bg-status-limited" />
        <span className="text-[10px] text-status-limited font-semibold tracking-wider uppercase">{t('onboarding.in_progress')}</span>
      </motion.div>
    </motion.div>
  );
}

/* ── Vision stat line for Screen 4 ── */
function VisionLine() {
  const { t } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="mt-5 relative pl-4 border-l-2 border-primary/30"
    >
      <p className="text-[12px] text-muted-foreground/80 leading-relaxed italic">
        {t('onboarding.vision_quote') || 'Один интерфейс. Все сети. Без фрагментации.'}
      </p>
    </motion.div>
  );
}

/* ── Main Component ── */
export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const { completeOnboarding } = useApp();
  const { t } = useI18n();
  const swiping = useRef(false);

  const goTo = useCallback((target: number) => {
    if (target < 0 || target >= slides.length) return;
    setDirection(target > step ? 1 : -1);
    setStep(target);
  }, [step]);

  const next = useCallback(() => {
    if (step < slides.length - 1) {
      setDirection(1);
      setStep(s => s + 1);
    } else {
      completeOnboarding();
    }
  }, [step, completeOnboarding]);

  const back = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  }, [step]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      if (info.offset.x < 0 && step < slides.length - 1) next();
      else if (info.offset.x > 0 && step > 0) back();
    }
  };

  const isLast = step === slides.length - 1;

  const contentVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -40 }),
  };

  const imageVariants = {
    enter: { opacity: 0, scale: 1.04 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
  };

  // Per-screen label styling — visually distinct categories
  const labelConfig = [
    { className: 'bg-primary/8 text-primary border border-primary/15' },
    { className: 'bg-primary/8 text-primary border border-primary/15' },
    { className: 'bg-status-limited/8 text-status-limited border border-status-limited/15' },
    { className: 'bg-muted/60 text-muted-foreground border border-border/40' },
  ];

  // Per-screen extra content
  const screenExtras = [
    <AggregationProof key="agg" />,
    <DecisionMetrics key="dec" />,
    <RoadmapModules key="road" />,
    <VisionLine key="vis" />,
  ];

  // Image area height varies per screen for visual rhythm
  const imageHeights = ['h-[44%]', 'h-[40%]', 'h-[38%]', 'h-[42%]'];

  return (
    <div className="fixed inset-0 bg-background flex flex-col z-50 overflow-hidden">
      {/* Visual area */}
      <div
        className={`relative ${imageHeights[step]} min-h-[180px] overflow-hidden transition-all duration-500`}
        onTouchStart={() => { swiping.current = true; }}
        onTouchEnd={() => { swiping.current = false; }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
          >
            <img
              src={slides[step].image}
              alt=""
              className="w-full h-full object-cover select-none pointer-events-none"
              draggable={false}
            />
            {/* Gradient overlay — stronger fade into content */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background" />
            {/* Side vignette for depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />
          </motion.div>
        </AnimatePresence>

        {/* Back button */}
        <AnimatePresence>
          {step > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={back}
              className="absolute top-4 left-4 z-10 w-9 h-9 rounded-xl surface-glass border border-border/20 flex items-center justify-center transition-colors hover:bg-card-elevated active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 text-foreground/70" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Step counter */}
        <div className="absolute top-4 right-4 z-10">
          <span className="text-[11px] font-mono text-foreground/30 tracking-wider">
            {step + 1}/{slides.length}
          </span>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col px-6 pt-4 pb-5 max-w-[420px] mx-auto w-full relative z-10 overflow-y-auto">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex-1 flex flex-col"
          >
            {/* Label */}
            <div className="mb-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-md text-[10px] font-semibold tracking-wider uppercase ${labelConfig[step].className}`}>
                {t(`onboarding.${step + 1}.label`)}
              </span>
            </div>

            {/* Headline */}
            <h2 className="font-display text-[22px] font-bold text-foreground leading-[1.25] tracking-tight mb-2.5">
              {t(`onboarding.${step + 1}.title`)}
            </h2>

            {/* Body */}
            <p className="text-muted-foreground text-[13px] leading-[1.7] max-w-[360px]">
              {t(`onboarding.${step + 1}.subtitle`)}
            </p>

            {/* Per-screen unique content */}
            {screenExtras[step]}
          </motion.div>
        </AnimatePresence>

        {/* Progress + CTAs — always at bottom */}
        <div className="space-y-3.5 safe-bottom pt-3 mt-auto">
          {/* Progress indicator */}
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="h-[3px] flex-1 rounded-full transition-all duration-500 relative overflow-hidden bg-border/60"
              >
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary"
                  initial={false}
                  animate={{ scaleX: i <= step ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{ transformOrigin: 'left' }}
                />
              </button>
            ))}
          </div>

          {/* Primary CTA */}
          <button
            onClick={next}
            className={`w-full py-[14px] rounded-[14px] font-display font-semibold text-[15px] tracking-tight transition-all active:scale-[0.98] bg-primary text-primary-foreground hover:opacity-90 ${
              isLast ? 'glow-primary-subtle' : ''
            }`}
          >
            {isLast ? t('onboarding.open_app') : t('onboarding.continue')}
          </button>

          {/* Skip */}
          {!isLast && (
            <button
              onClick={completeOnboarding}
              className="w-full py-1 text-muted-foreground/50 text-[12px] hover:text-muted-foreground transition-colors"
            >
              {t('onboarding.skip')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
