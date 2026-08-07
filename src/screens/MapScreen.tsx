/* מסך הבית — מפת ממו לנד: 6 ארצות על שביל מתפתל עם דגלים וטירות,
   דרגת ממו, וכפתור "המסע של היום". לחיצה ארוכה על הלוגו פותחת שער הורים. */
import { useRef } from 'react';
import { getActiveProfile, useProfiles, useStore } from '../state/store';
import { LAND_ORDER, LANDS, TRACKS_PER_LAND, landColor } from '../config/lands';
import { playableLands } from '../engines';
import { StatusBar } from '../components/StatusBar';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { Memo, Guide, guideKindFor } from '../components/svg/Memo';
import { FlagIcon } from '../components/svg/Icons';
import { rankLabel, rankProgress } from '../state/rewards';
import type { LandId } from '../types';

export function MapScreen({
  onStartJourney,
  onPlayLand,
  onOpenParent,
  onSwitchProfile,
}: {
  onStartJourney: () => void;
  onPlayLand: (land: LandId) => void;
  onOpenParent: () => void;
  onSwitchProfile: () => void;
}) {
  const coins = useStore((s) => s.coins);
  const rank = useStore((s) => s.rank);
  const lands = useStore((s) => s.lands);
  // עדכון כשמחליפים פרופיל
  useProfiles((r) => r.activeId);
  const profile = getActiveProfile();
  const playable = playableLands();
  const rp = rankProgress(coins);
  const journeyGoal = 500;
  const journeyDone = Math.min(journeyGoal, coins % 500 || (coins > 0 ? 500 : 0));

  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPress = () => {
    pressTimer.current = setTimeout(onOpenParent, 750);
  };
  const endPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: 'linear-gradient(#8fd8ff,#58C548)' }}>
      {/* כותרת עליונה */}
      <div style={{ position: 'sticky', top: 0, zIndex: 5, background: 'rgba(103,200,255,.92)', backdropFilter: 'blur(4px)', paddingTop: 'var(--safe-top)' }}>
        <div
          style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}
          onPointerDown={startPress}
          onPointerUp={endPress}
          onPointerLeave={endPress}
          title="לחיצה ארוכה — הורים"
        >
          <Logo variant="compact" width={170} />
        </div>
        {/* צ'יפ המשתמש הפעיל — הקשה מחליפה משתמש */}
        {profile && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
            <button
              onClick={onSwitchProfile}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--panel)', border: '2px solid var(--gray-300)', borderRadius: 999, padding: '3px 12px 3px 6px', boxShadow: '0 2px 0 rgba(36,50,71,.12)' }}
            >
              <Guide kind={profile.avatar} size={26} />
              <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{profile.name}</span>
              <span style={{ fontSize: 12, color: 'var(--btn-blue)', fontWeight: 700 }}>החלף ⇄</span>
            </button>
          </div>
        )}
        <StatusBar coins={coins} journeyDone={journeyDone} journeyGoal={journeyGoal} />
      </div>

      {/* דרגת ממו */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', padding: '6px 16px' }}>
        <Memo size={72} rank={rank} bounce />
        <div style={{ background: 'var(--panel)', border: '2px solid var(--gray-300)', borderRadius: 14, padding: '8px 14px' }}>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--ink)' }}>{rankLabel(rank)}</div>
          <div style={{ width: 150, height: 10, background: 'var(--gray-300)', borderRadius: 999, overflow: 'hidden', marginTop: 4 }}>
            <div style={{ width: `${rp.ratio * 100}%`, height: '100%', background: 'var(--btn-purple)' }} />
          </div>
        </div>
      </div>

      {/* השביל המתפתל */}
      <div style={{ position: 'relative', padding: '10px 0 24px' }}>
        {LAND_ORDER.map((id, i) => {
          const meta = LANDS[id];
          const prog = lands[id];
          const isPlayable = playable.includes(id);
          const side = i % 2 === 0 ? 'flex-start' : 'flex-end';
          const color = landColor(id);
          return (
            <div key={id} style={{ display: 'flex', justifyContent: side, padding: '0 22px', margin: '10px 0' }}>
              <button
                onClick={() => isPlayable && onPlayLand(id)}
                disabled={!isPlayable}
                style={{
                  position: 'relative',
                  width: 260,
                  maxWidth: '80%',
                  background: 'var(--panel)',
                  border: `4px solid ${color}`,
                  borderRadius: 20,
                  padding: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow: '0 5px 0 rgba(36,50,71,.25)',
                  opacity: isPlayable ? 1 : 0.75,
                  cursor: isPlayable ? 'pointer' : 'default',
                  textAlign: 'start',
                }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Guide kind={guideKindFor(meta.guide)} size={58} />
                  {prog.castleOpen && (
                    <span style={{ position: 'absolute', insetInlineEnd: -6, top: -6, fontSize: 20 }}>🏰</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 18, color }}>{meta.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink)', opacity: 0.7 }}>{meta.subtitle}</div>
                  {isPlayable ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <FlagIcon size={16} />
                      <span className="ltr" style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 13 }}>
                        {prog.completedTracks}/{TRACKS_PER_LAND}
                      </span>
                      <span style={{ fontSize: 12, opacity: 0.6 }}>מסלולים</span>
                    </div>
                  ) : (
                    <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: 'var(--btn-orange)' }}>בקרוב 🚧</div>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* כפתור המסע היומי — צף בתחתית */}
      <div style={{ position: 'sticky', bottom: 0, padding: '12px 16px calc(16px + var(--safe-top))', background: 'linear-gradient(transparent, rgba(88,197,72,.9) 40%)' }}>
        <Button variant="purple" size="lg" block icon="🧠" onClick={onStartJourney}>
          המסע של היום
        </Button>
      </div>
    </div>
  );
}
