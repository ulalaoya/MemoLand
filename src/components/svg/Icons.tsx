/* אייקוני משוב וגרפיקת עולם כ-SVG מקורי (לא אימוג'י מערכת) —
   כדי שייראו זהים בכל מכשיר. מתאר --ink עקבי, צללים מוצקים. */
import type { CSSProperties } from 'react';

interface IconProps {
  size?: number;
  style?: CSSProperties;
  className?: string;
}
const INK = 'var(--ink)';

export function StarIcon({ size = 28, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={style} className={className} aria-hidden>
      <path
        d="M16 2l4.2 8.5 9.4 1.4-6.8 6.6 1.6 9.3L16 23l-8.4 4.4 1.6-9.3L2.4 11.9l9.4-1.4z"
        fill="var(--yellow)"
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12.5" cy="14" r="1.5" fill={INK} />
      <circle cx="19.5" cy="14" r="1.5" fill={INK} />
    </svg>
  );
}

export function HeartIcon({ size = 28, style, className, empty = false }: IconProps & { empty?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={style} className={className} aria-hidden>
      <path
        d="M16 28C6 21 3 15 3 10.5 3 6.9 5.9 4 9.5 4 12 4 14.3 5.4 16 7.6 17.7 5.4 20 4 22.5 4 26.1 4 29 6.9 29 10.5 29 15 26 21 16 28z"
        fill={empty ? 'var(--gray-300)' : 'var(--red)'}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
        opacity={empty ? 0.8 : 1}
      />
    </svg>
  );
}

export function TrophyIcon({ size = 28, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={style} className={className} aria-hidden>
      <path d="M9 5h14v6a7 7 0 01-14 0z" fill="var(--gold)" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 7H5v2a4 4 0 004 4M23 7h4v2a4 4 0 01-4 4" fill="none" stroke={INK} strokeWidth="2" />
      <rect x="13" y="18" width="6" height="5" fill="var(--gold-deep)" stroke={INK} strokeWidth="2" />
      <rect x="9" y="23" width="14" height="4" rx="1" fill="var(--gold)" stroke={INK} strokeWidth="2" />
    </svg>
  );
}

export function FireIcon({ size = 28, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={style} className={className} aria-hidden>
      <path
        d="M16 3c1 5-3 6-3 10a3 3 0 006 0c0-1 0-2-1-3 3 2 5 5 5 9a7 7 0 11-14 0c0-6 6-8 7-16z"
        fill="var(--btn-orange)"
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M16 20a3 3 0 003 3 3 3 0 01-6 0c0-2 1-2 3-3z" fill="var(--yellow)" />
    </svg>
  );
}

export function TargetIcon({ size = 28, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={style} className={className} aria-hidden>
      <circle cx="16" cy="16" r="13" fill="var(--panel)" stroke={INK} strokeWidth="2" />
      <circle cx="16" cy="16" r="8.5" fill="var(--btn-blue)" stroke={INK} strokeWidth="2" />
      <circle cx="16" cy="16" r="4" fill="var(--red)" stroke={INK} strokeWidth="2" />
    </svg>
  );
}

export function RocketIcon({ size = 28, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={style} className={className} aria-hidden>
      <path d="M16 3c5 3 7 8 7 13l-3 3h-8l-3-3c0-5 2-10 7-13z" fill="var(--panel)" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="16" cy="13" r="2.5" fill="var(--btn-blue)" stroke={INK} strokeWidth="2" />
      <path d="M12 19l-3 4 4-1M20 19l3 4-4-1" fill="var(--red)" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 22h4l-2 6z" fill="var(--btn-orange)" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function PartyIcon({ size = 28, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={style} className={className} aria-hidden>
      <path d="M6 27L14 9l9 9z" fill="var(--btn-purple)" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="24" cy="6" r="2" fill="var(--red)" />
      <circle cx="28" cy="12" r="2" fill="var(--green)" />
      <circle cx="20" cy="4" r="1.6" fill="var(--yellow)" />
      <circle cx="12" cy="18" r="1.4" fill="var(--yellow)" />
    </svg>
  );
}

export function BrainIcon({ size = 28, style, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={style} className={className} aria-hidden>
      <path
        d="M12 5a4 4 0 00-4 4 4 4 0 00-2 7 4 4 0 004 5 4 4 0 006 1 4 4 0 006-1 4 4 0 004-5 4 4 0 00-2-7 4 4 0 00-4-4 4 4 0 00-8 0z"
        fill="var(--btn-purple)"
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M16 6v20M11 12h4M17 16h4M11 20h5" fill="none" stroke="var(--panel)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** מטבע זהב מסתובב (אנימציה דרך className). */
export function Coin({ size = 28, spin = false, style }: IconProps & { spin?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      style={{ ...style, animation: spin ? 'coin-spin 1.2s linear infinite' : undefined }}
      aria-hidden
    >
      <circle cx="16" cy="16" r="13" fill="var(--gold)" stroke={INK} strokeWidth="2" />
      <circle cx="16" cy="16" r="9" fill="var(--gold-lite)" stroke="var(--gold-deep)" strokeWidth="1.5" />
      <text x="16" y="21" textAnchor="middle" fontFamily="Lilita One, sans-serif" fontSize="13" fill="var(--gold-deep)">
        ★
      </text>
    </svg>
  );
}

/** דגל שעולה בסיום מסלול. */
export function FlagIcon({ size = 28, style, planted = true }: IconProps & { planted?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={style} aria-hidden>
      <line x1="9" y1="4" x2="9" y2="29" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      {planted && (
        <path d="M9 5h14l-4 4 4 4H9z" fill="var(--btn-green)" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      )}
    </svg>
  );
}

/** מדליית הישג בשלוש דרגות. */
export function Medal({ tier, size = 40 }: { tier: 'bronze' | 'silver' | 'gold'; size?: number }) {
  const colors = {
    bronze: { ring: '#C77B3B', face: '#E39A5A' },
    silver: { ring: '#9AA6B2', face: '#C9D3DC' },
    gold: { ring: 'var(--gold-deep)', face: 'var(--gold)' },
  }[tier];
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <path d="M13 3h6l-3 12-4-2z" fill="var(--btn-blue)" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M27 3h-6l3 12 4-2z" fill="var(--red)" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="20" cy="26" r="12" fill={colors.ring} stroke={INK} strokeWidth="2" />
      <circle cx="20" cy="26" r="8" fill={colors.face} stroke={INK} strokeWidth="1.5" />
      <path d="M20 20l1.8 3.6 4 .6-2.9 2.8.7 4L20 28.7l-3.6 1.9.7-4-2.9-2.8 4-.6z" fill={INK} opacity="0.55" />
    </svg>
  );
}
