/* כרטיסי הסטטוס הקבועים בראש המסך (סעיף 9):
   לבבות (תמיד מלאים — אין game over), מטבעות, ומד המסע היומי.
   כרטיס = גלולה לבנה, מסגרת אפורה, אייקון עגול צבעוני בקצה, מספר Rubik 600. */
import { Coin, HeartIcon } from './svg/Icons';

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--panel)',
        border: '2px solid var(--gray-300)',
        borderRadius: 999,
        padding: '5px 12px 5px 8px',
        boxShadow: '0 2px 0 rgba(36,50,71,.12)',
        fontFamily: 'var(--font-head)',
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}

export function StatusBar({ coins, journeyDone, journeyGoal }: { coins: number; journeyDone: number; journeyGoal: number }) {
  const pct = Math.max(0, Math.min(1, journeyGoal ? journeyDone / journeyGoal : 0));
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', padding: '8px 10px' }}>
      {/* לבבות — תמיד מלאים, אין איבוד */}
      <Pill>
        <span style={{ display: 'flex' }}>
          {[0, 1, 2].map((i) => (
            <HeartIcon key={i} size={18} style={{ marginInlineStart: i ? -2 : 0 }} />
          ))}
        </span>
      </Pill>

      {/* מטבעות */}
      <Pill>
        <Coin size={22} />
        <span className="ltr" style={{ minWidth: 28, textAlign: 'center' }}>
          {coins}
        </span>
      </Pill>

      {/* מד המסע היומי */}
      <Pill>
        <div style={{ width: 70, height: 12, background: 'var(--gray-300)', borderRadius: 999, overflow: 'hidden', border: '1px solid var(--gray-300)' }}>
          <div style={{ width: `${pct * 100}%`, height: '100%', background: 'var(--btn-blue)', transition: 'width .4s' }} />
        </div>
        <span className="ltr" style={{ fontSize: 13, color: 'var(--ink)' }}>
          {journeyDone}/{journeyGoal}
        </span>
      </Pill>
    </div>
  );
}
