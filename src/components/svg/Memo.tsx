/* ממו והמדריכים — SVG מקורי לפי ה-Style Guide.
   ממו: שיער חום, משקפי מגן כחולים, צעיף כתום, חולצה כחולה.
   פריטי דרגה גלויים: בנדנה / גלימה / כנפיים. */
import type { MemoRank } from '../../types';

const INK = 'var(--ink)';

export function Memo({ size = 120, rank = 'beginner', bounce = false }: { size?: number; rank?: MemoRank; bounce?: boolean }) {
  const showBandana = rank === 'scout' || rank === 'adventurer' || rank === 'hero' || rank === 'legend';
  const showCape = rank === 'adventurer' || rank === 'hero' || rank === 'legend';
  const showWings = rank === 'hero' || rank === 'legend';
  const crown = rank === 'legend';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      style={{ animation: bounce ? 'memo-bounce 1.6s ease-in-out infinite' : undefined, overflow: 'visible' }}
      aria-label="ממו"
    >
      {showWings && (
        <g>
          <path d="M40 60C20 52 14 66 22 78c8-4 14-4 20 0z" fill="var(--panel)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M80 60c20-8 26 6 18 18-8-4-14-4-20 0z" fill="var(--panel)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        </g>
      )}
      {showCape && (
        <path d="M42 55h36l6 48H36z" fill="var(--btn-purple)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      )}
      {/* גוף / חולצה */}
      <path d="M44 62h32c4 0 6 3 6 7v22c0 4-3 7-7 7H45c-4 0-7-3-7-7V69c0-4 2-7 6-7z" fill="var(--memo-shirt)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      {/* חגורה */}
      <rect x="40" y="86" width="40" height="7" rx="2" fill="var(--memo-belt)" stroke={INK} strokeWidth="2.5" />
      {/* צעיף */}
      <path d="M46 62c6 6 22 6 28 0l-4 8c-6 4-14 4-20 0z" fill="var(--memo-scarf)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      {/* ראש */}
      <circle cx="60" cy="42" r="22" fill="#F6C89A" stroke={INK} strokeWidth="2.5" />
      {/* שיער */}
      <path d="M38 40c0-16 12-24 22-24s22 8 22 22c-4-6-8-8-8-8s-2 6-6 6-4-6-4-6-3 7-8 7-4-6-4-6-4 4-6 9z" fill="var(--memo-hair)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      {/* משקפי מגן */}
      <g>
        <rect x="40" y="26" width="40" height="8" rx="4" fill="var(--memo-belt)" stroke={INK} strokeWidth="2" />
        <circle cx="50" cy="30" r="7" fill="var(--memo-goggles)" stroke={INK} strokeWidth="2.5" />
        <circle cx="70" cy="30" r="7" fill="var(--memo-goggles)" stroke={INK} strokeWidth="2.5" />
        <circle cx="48" cy="28" r="2" fill="#fff" />
        <circle cx="68" cy="28" r="2" fill="#fff" />
      </g>
      {/* עיניים ופה */}
      <circle cx="53" cy="46" r="2.6" fill={INK} />
      <circle cx="67" cy="46" r="2.6" fill={INK} />
      <path d="M52 53c4 4 12 4 16 0" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      {showBandana && (
        <path d="M38 24h44l-3 7H41z" fill="var(--red)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      )}
      {crown && (
        <path d="M46 14l5 6 9-8 9 8 5-6 2 10H44z" fill="var(--gold)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      )}
    </svg>
  );
}

/** מדריך לפי סוג — SVG פשוט וזיהוי מהיר. */
export function Guide({ kind, size = 84 }: { kind: 'water' | 'purple' | 'mushroom' | 'turtle' | 'memo'; size?: number }) {
  if (kind === 'memo') return <Memo size={size} />;
  if (kind === 'water')
    return (
      <svg width={size} height={size} viewBox="0 0 84 84" aria-label="טיפת המים">
        <path d="M42 8C30 26 20 38 20 52a22 22 0 0044 0C64 38 54 26 42 8z" fill="var(--guide-water)" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="34" cy="50" r="4.5" fill="#fff" /><circle cx="34" cy="50" r="2" fill={INK} />
        <circle cx="50" cy="50" r="4.5" fill="#fff" /><circle cx="50" cy="50" r="2" fill={INK} />
        <path d="M36 60c4 4 8 4 12 0" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="30" cy="40" rx="4" ry="6" fill="#fff" opacity="0.5" />
      </svg>
    );
  if (kind === 'purple')
    return (
      <svg width={size} height={size} viewBox="0 0 84 84" aria-label="המפלצת הסגולה">
        <path d="M20 46a22 22 0 0144 0v20c0 3-3 4-5 2l-4-3-4 4-4-4-4 4-4-4-4 3c-2 2-5 1-5-2z" fill="var(--guide-purple)" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M24 30l-4-8 8 4M60 30l4-8-8 4" fill="var(--guide-purple)" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="34" cy="44" r="6" fill="#fff" stroke={INK} strokeWidth="2" /><circle cx="34" cy="45" r="2.5" fill={INK} />
        <circle cx="50" cy="44" r="6" fill="#fff" stroke={INK} strokeWidth="2" /><circle cx="50" cy="45" r="2.5" fill={INK} />
        <path d="M34 56h16l-3 4h-10z" fill="#fff" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  if (kind === 'mushroom')
    return (
      <svg width={size} height={size} viewBox="0 0 84 84" aria-label="הפטרייה">
        <path d="M14 44a28 20 0 0156 0z" fill="var(--red)" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="28" cy="34" r="5" fill="#fff" /><circle cx="50" cy="30" r="6" fill="#fff" /><circle cx="42" cy="40" r="4" fill="#fff" />
        <path d="M30 44h24v18a12 12 0 01-24 0z" fill="#F6E7C1" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="37" cy="54" r="2.4" fill={INK} /><circle cx="47" cy="54" r="2.4" fill={INK} />
        <path d="M38 60c2 2 6 2 8 0" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  // turtle
  return (
    <svg width={size} height={size} viewBox="0 0 84 84" aria-label="הצב">
      <ellipse cx="42" cy="50" rx="26" ry="18" fill="var(--guide-green)" stroke={INK} strokeWidth="3" />
      <path d="M42 34a18 14 0 0118 16H24a18 14 0 0118-16z" fill="var(--green)" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M42 36v14M30 46h24" stroke={INK} strokeWidth="2" />
      <circle cx="66" cy="46" r="8" fill="var(--guide-green)" stroke={INK} strokeWidth="3" />
      <circle cx="68" cy="44" r="2.2" fill={INK} />
      <path d="M16 62l-4 6M32 66l-2 6M52 66l2 6M68 62l4 6" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function guideKindFor(landGuide: string): 'water' | 'purple' | 'mushroom' | 'turtle' | 'memo' {
  switch (landGuide) {
    case 'טיפת המים':
      return 'water';
    case 'המפלצת הסגולה':
      return 'purple';
    case 'הפטרייה':
      return 'mushroom';
    case 'הצב':
      return 'turtle';
    default:
      return 'memo';
  }
}
