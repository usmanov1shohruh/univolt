/**
 * CSS variables set when mapping Telegram theme into shadcn tokens.
 * Removing them restores preset light/dark from `index.css` (:root / .dark).
 */
export const SHADCN_INLINE_THEME_VARS = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--border",
  "--input",
  "--primary",
  "--primary-foreground",
  "--surface",
  "--surface-elevated",
] as const;

export function clearShadcnThemeInlineVars(target: HTMLElement): void {
  for (const key of SHADCN_INLINE_THEME_VARS) {
    target.style.removeProperty(key);
  }
}
