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

/** אריח דמות — תמונה על רקע לבן מעוגל עם מסגרת עדינה וצל. */
export function Character({
  kind,
  size = 84,
  bounce = false,
  ring,
  style,
}: {
  kind: CharKind;
  size?: number;
  bounce?: boolean;
  ring?: string; // צבע מסגרת (ברירת מחדל: אפור עדין)
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.26),
        background: '#fff',
        border: `${Math.max(2, size * 0.03)}px solid ${ring ?? 'var(--gray-300)'}`,
        boxShadow: '0 3px 0 rgba(36,50,71,.18)',
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        animation: bounce ? 'memo-bounce 1.8s ease-in-out infinite' : undefined,
        ...style,
      }}
    >
      <img
        src={SRC[kind]}
        alt={LABEL[kind]}
        draggable={false}
        style={{ width: '92%', height: '92%', objectFit: 'contain' }}
      />
    </div>
  );
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
