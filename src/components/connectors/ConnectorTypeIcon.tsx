import type { ConnectorType } from '@/types/station';
import { cn } from '@/lib/utils';

const ORDER: ConnectorType[] = ['Type2', 'CCS2', 'CHAdeMO', 'GB/T', 'J1772'];

export function sortConnectorTypesForDisplay(types: ConnectorType[]): ConnectorType[] {
  const set = new Set(types);
  return ORDER.filter((t) => set.has(t));
}

/**
 * Simplified line-art socket faces (not to scale) for map-style UI.
 */
export function ConnectorTypeIcon({
  type,
  className,
}: {
  type: ConnectorType;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/80 bg-card text-foreground/85 shadow-sm',
        className,
      )}
      title={type}
      aria-hidden
    >
      <svg
        viewBox="0 0 48 48"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {type === 'Type2' && <Type2Face />}
        {type === 'CCS2' && <Ccs2Face />}
        {type === 'CHAdeMO' && <ChademoFace />}
        {type === 'GB/T' && <GbtFace />}
        {type === 'J1772' && <J1772Face />}
      </svg>
    </div>
  );
}

function Type2Face() {
  return (
    <>
      <circle cx="24" cy="24" r="14" opacity={0.35} />
      <path d="M14 22h20M18 18h12M18 26h12" />
      <circle cx="16" cy="16" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="24" cy="14" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="32" cy="16" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="14" cy="24" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="34" cy="24" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="16" cy="32" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="24" cy="34" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="32" cy="32" r="1.8" fill="currentColor" stroke="none" />
    </>
  );
}

function Ccs2Face() {
  return (
    <>
      <path d="M10 30c0-7.7 6.3-14 14-14s14 6.3 14 14" opacity={0.4} />
      <path d="M18 18h12M18 22h12" />
      <circle cx="16" cy="16" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="24" cy="14" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="32" cy="16" r="1.6" fill="currentColor" stroke="none" />
      <rect x="17" y="30" width="5" height="10" rx="1" />
      <rect x="26" y="30" width="5" height="10" rx="1" />
    </>
  );
}

function ChademoFace() {
  return (
    <>
      <rect x="12" y="20" width="24" height="14" rx="2" />
      <path d="M16 24h16M16 28h10" />
      <circle cx="20" cy="32" r="2" />
      <circle cx="28" cy="32" r="2" />
      <path d="M24 12v6" />
    </>
  );
}

function GbtFace() {
  return (
    <>
      <circle cx="24" cy="24" r="13" opacity={0.35} />
      <path d="M15 21h18M15 27h18" />
      <circle cx="18" cy="18" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="24" cy="16" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="30" cy="18" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="16" cy="24" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="32" cy="24" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="18" cy="30" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="24" cy="32" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="30" cy="30" r="1.6" fill="currentColor" stroke="none" />
    </>
  );
}

function J1772Face() {
  return (
    <>
      <circle cx="24" cy="24" r="14" opacity={0.35} />
      <circle cx="24" cy="18" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="17" cy="22" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="31" cy="22" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="19" cy="30" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="29" cy="30" r="1.8" fill="currentColor" stroke="none" />
      <path d="M24 26v6" />
    </>
  );
}
