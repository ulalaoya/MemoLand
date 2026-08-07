/* מסך ההישגים — מדליות שהושגו + יעד לכל עולם עם התקדמות. */
import { useStore } from '../state/store';
import { WORLD_GOALS } from '../config/collectibles';
import { LANDS, landColor } from '../config/lands';
import { enginesForLand } from '../engines';
import { Medal } from '../components/svg/Icons';
import { LandIcon } from '../components/svg/LandIcon';
import { Button } from '../components/Button';
import type { Medal as MedalType } from '../types';

const MEDAL_DEFS: { id: string; tier: MedalType['tier']; name: string; desc: string }[] = [
  { id: 'streak7', tier: 'gold', name: 'שבוע רצוף', desc: '7 ימים ברצף' },
  { id: 'span7', tier: 'silver', name: 'זיכרון ברזל', desc: 'span של 7 פריטים' },
  { id: 'land-complete', tier: 'bronze', name: 'כובש ארצות', desc: 'השלמת ארץ שלמה' },
  { id: 'coins1000', tier: 'gold', name: 'אספן מטבעות', desc: '1000 מטבעות' },
];

export function AchievementsScreen({ onExit }: { onExit: () => void }) {
  const earned = useStore((s) => s.medals);
  const stats = useStore((s) => s.stats);
  const earnedIds = new Set(earned.map((m) => m.id));

  const landMaxLevel = (land: (typeof WORLD_GOALS)[number]['land']) =>
    Math.max(1, ...enginesForLand(land).map((e) => stats[e.id]?.level ?? 1));

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--gray-100)', overflowY: 'auto', color: 'var(--ink)' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 3, background: 'var(--btn-orange)', color: '#fff', padding: 'calc(12px + var(--safe-top)) 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <b style={{ fontFamily: 'var(--font-head)', fontSize: 20 }}>🏆 ההישגים שלי</b>
        <button onClick={onExit} style={{ background: '#fff', color: 'var(--ink)', border: 'none', borderRadius: 999, padding: '6px 14px', fontWeight: 700 }}>סגור</button>
      </header>

      <div style={{ padding: '14px 14px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <section>
          <h3 style={{ marginBottom: 8 }}>מדליות</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {MEDAL_DEFS.map((m) => {
              const has = earnedIds.has(m.id);
              return (
                <div key={m.id} style={{ background: 'var(--panel)', borderRadius: 14, padding: 12, display: 'flex', alignItems: 'center', gap: 10, border: '2px solid var(--gray-300)', opacity: has ? 1 : 0.5, filter: has ? undefined : 'grayscale(1)' }}>
                  <Medal tier={m.tier} size={40} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14 }}>{m.name}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{m.desc}</div>
                    {!has && <div style={{ fontSize: 11, color: 'var(--btn-orange)', fontWeight: 700 }}>עדיין נעול</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: 8 }}>יעד לכל עולם</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {WORLD_GOALS.map((g) => {
              const lvl = landMaxLevel(g.land);
              const pct = Math.min(1, lvl / g.targetLevel);
              const done = lvl >= g.targetLevel;
              const color = landColor(g.land);
              return (
                <div key={g.land} style={{ background: 'var(--panel)', borderRadius: 14, padding: 10, display: 'flex', alignItems: 'center', gap: 10, border: `2px solid ${color}` }}>
                  <LandIcon land={g.land} size={44} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14, color }}>{LANDS[g.land].name} {done && '✓'}</div>
                    <div style={{ height: 9, background: 'var(--gray-300)', borderRadius: 999, overflow: 'hidden', margin: '5px 0 2px' }}>
                      <div style={{ width: `${pct * 100}%`, height: '100%', background: color }} />
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>רמה <span className="ltr">{lvl}/{g.targetLevel}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Button variant="orange" block onClick={onExit}>חזרה למפה</Button>
      </div>
    </div>
  );
}
