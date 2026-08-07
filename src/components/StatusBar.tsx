/* סרגל עליון — כל ההישגים למעלה:
   ימין: שם המשתמש + לבבות. מרכז: הדרגה + התקדמות בדרגה.
   שמאל: מטבעות + בר התקדמות יומית. מתחת: לוגו MemoLand + האוואטר שנבחר. */
import { useRef } from 'react';
import type { MemoRank, Profile } from '../types';
import { Coin, HeartIcon } from './svg/Icons';
import { Character } from './svg/Memo';
import { Logo } from './Logo';
import { rankLabel, rankProgress } from '../state/rewards';
import { DAILY_GOAL } from '../state/store';

export function TopBar({
  profile,
  coins,
  rank,
  todayPoints,
  equippedHat,
  onSwitch,
  onOpenParent,
}: {
  profile: Profile | null;
  coins: number;
  rank: MemoRank;
  todayPoints: number;
  equippedHat?: string;
  onSwitch: () => void;
  onOpenParent: () => void;
}) {
  const rp = rankProgress(coins);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPress = () => { pressTimer.current = setTimeout(onOpenParent, 750); };
  const endPress = () => { if (pressTimer.current) clearTimeout(pressTimer.current); };
  const dailyPct = Math.max(0, Math.min(1, todayPoints / DAILY_GOAL));

  return (
    <div style={{ padding: '8px 12px 10px' }}>
      {/* שורת ההישגים */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        {/* ימין: שם + לבבות */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, minWidth: 78 }}>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, color: 'var(--ink)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {profile?.name ?? ''}
          </span>
          <span style={{ display: 'flex' }}>
            {[0, 1, 2].map((i) => (
              <HeartIcon key={i} size={17} style={{ marginInlineStart: i ? -2 : 0 }} />
            ))}
          </span>
        </div>

        {/* מרכז: דרגה + התקדמות */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1 }}>
          <span style={{ fontSize: 11, color: 'var(--ink)', opacity: 0.6, fontWeight: 600 }}>דרגה</span>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, color: 'var(--btn-purple)' }}>{rankLabel(rank)}</span>
          <div style={{ width: 108, height: 9, background: 'var(--gray-300)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${rp.ratio * 100}%`, height: '100%', background: 'var(--btn-purple)', transition: 'width .4s' }} />
          </div>
          {rp.next !== null ? (
            <span style={{ fontSize: 10, opacity: 0.6 }}>
              עוד <span className="ltr">{Math.max(0, rp.next - coins)}</span> לדרגה הבאה
            </span>
          ) : (
            <span style={{ fontSize: 10, opacity: 0.6 }}>הדרגה הגבוהה ביותר!</span>
          )}
        </div>

        {/* שמאל: מטבעות + בר יומי */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, minWidth: 78 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15 }}>
            <span className="ltr">{coins}</span>
            <Coin size={20} />
          </span>
          <div style={{ width: 84, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
            <div style={{ width: '100%', height: 9, background: 'var(--gray-300)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${dailyPct * 100}%`, height: '100%', background: 'var(--gold)', transition: 'width .4s' }} />
            </div>
            <span style={{ fontSize: 10, opacity: 0.6 }}>
              היום <span className="ltr">{todayPoints}/{DAILY_GOAL}</span>
            </span>
          </div>
        </div>
      </div>

      {/* לוגו + אוואטר */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 8 }}>
        <div onPointerDown={startPress} onPointerUp={endPress} onPointerLeave={endPress} title="לחיצה ארוכה — הורים">
          <Logo variant="compact" width={128} />
        </div>
        {profile && (
          <button
            onClick={onSwitch}
            style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer' }}
          >
            <Character kind={profile.avatar} size={52} bounce hat={equippedHat} />
            <span style={{ fontSize: 11, color: 'var(--btn-blue)', fontWeight: 700 }}>החלף ⇄</span>
          </button>
        )}
      </div>
    </div>
  );
}
