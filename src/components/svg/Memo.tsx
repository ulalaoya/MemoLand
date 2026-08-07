/* ממו והמדריכים — תמונות מקוריות מתוך ה-Branding Board, בתוך "אריח" לבן
   מעוגל (בסגנון האייקון). נאמן לעיצוב שהתקבל. */
import type { CSSProperties } from 'react';
import type { AvatarKind, MemoRank } from '../../types';

type CharKind = AvatarKind; // 'memo' | 'water' | 'purple' | 'mushroom' | 'turtle'

const SRC: Record<CharKind, string> = {
  memo: './characters/memo.png',
  water: './characters/water.png',
  purple: './characters/purple.png',
  mushroom: './characters/mushroom.png',
  turtle: './characters/turtle.png',
};

const LABEL: Record<CharKind, string> = {
  memo: 'ממו',
  water: 'טיפת המים',
  purple: 'המפלצת הסגולה',
  mushroom: 'הפטרייה',
  turtle: 'הצב',
};

/** אריח דמות — תמונה על רקע לבן מעוגל עם מסגרת עדינה וצל.
    hat — מזהה כובע שהולבש מהאוספים (למשל 'hat.crown'). */
export function Character({
  kind,
  size = 84,
  bounce = false,
  ring,
  hat,
  style,
}: {
  kind: CharKind;
  size?: number;
  bounce?: boolean;
  ring?: string;
  hat?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.26),
        background: '#fff',
        border: `${Math.max(2, size * 0.03)}px solid ${ring ?? 'var(--gray-300)'}`,
        boxShadow: '0 3px 0 rgba(36,50,71,.18)',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
        animation: bounce ? 'memo-bounce 1.8s ease-in-out infinite' : undefined,
        ...style,
      }}
    >
      <img
        src={SRC[kind]}
        alt={LABEL[kind]}
        draggable={false}
        style={{ width: '92%', height: '92%', objectFit: 'contain', borderRadius: 'inherit' }}
      />
      {hat && (
        <div style={{ position: 'absolute', top: -size * 0.16, insetInlineEnd: size * 0.12, width: size * 0.5, height: size * 0.5 }}>
          <HatGlyph id={hat} />
        </div>
      )}
    </div>
  );
}

const INK2 = 'var(--ink)';
/** כובעים מהאוספים כ-SVG. */
export function HatGlyph({ id }: { id: string }) {
  const c = { width: '100%', height: '100%', viewBox: '0 0 48 48' } as const;
  switch (id) {
    case 'hat.crown':
      return <svg {...c}><path d="M6 34l3-18 8 9 7-13 7 13 8-9 3 18z" fill="var(--gold)" stroke={INK2} strokeWidth="2.5" strokeLinejoin="round" /><circle cx="9" cy="15" r="2.5" fill="var(--red)" /><circle cx="39" cy="15" r="2.5" fill="var(--red)" /><circle cx="24" cy="9" r="2.5" fill="var(--btn-blue)" /></svg>;
    case 'hat.wizard':
      return <svg {...c}><path d="M24 3 L38 38 L10 38 Z" fill="var(--btn-purple)" stroke={INK2} strokeWidth="2.5" strokeLinejoin="round" /><path d="M18 24l3 3 5-6" stroke="var(--yellow)" strokeWidth="2.5" fill="none" strokeLinecap="round" /><circle cx="24" cy="4" r="3" fill="var(--yellow)" /></svg>;
    case 'hat.party':
      return <svg {...c}><path d="M24 4 L36 38 L12 38 Z" fill="var(--btn-orange)" stroke={INK2} strokeWidth="2.5" strokeLinejoin="round" /><path d="M14 20h20M17 30h14" stroke="#fff" strokeWidth="2.5" /><circle cx="24" cy="5" r="3" fill="var(--btn-green)" /></svg>;
    case 'hat.cap':
      return <svg {...c}><path d="M8 30 a16 12 0 0132 0z" fill="var(--btn-blue)" stroke={INK2} strokeWidth="2.5" strokeLinejoin="round" /><path d="M40 30 h6 a3 3 0 01-3 4 H36" fill="var(--btn-blue)" stroke={INK2} strokeWidth="2.5" strokeLinejoin="round" /></svg>;
    default:
      return null;
  }
}

/** ממו — הדמות הראשית. שומר על ה-API הקודם (rank/bounce). */
export function Memo({ size = 120, bounce = false, ring }: { size?: number; rank?: MemoRank; bounce?: boolean; ring?: string }) {
  return <Character kind="memo" size={size} bounce={bounce} ring={ring} />;
}

/** מדריך/דמות לפי סוג. */
export function Guide({ kind, size = 84, ring }: { kind: CharKind; size?: number; ring?: string }) {
  return <Character kind={kind} size={size} ring={ring} />;
}

export function guideKindFor(landGuide: string): CharKind {
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
