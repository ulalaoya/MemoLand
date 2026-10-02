/* מסך ההישגים — מדליות שהושגו + יעד לכל עולם עם התקדמות. */
import { useStore } from '../state/store';
import { WORLD_GOALS } from '../config/collectibles';
import { LANDS, landColor } from '../config/lands';
import { enginesForLand } from '../engines';
import { Medal } from '../components/svg/Icons';
import { LandIcon } from '../components/svg/LandIcon';
import { Button } from '../components/Button';
import type { Medal as MedalType } from '../types';
import './meta-screens.css';
import { JourneyAchievementGlyph } from '../components/world/PlayerHUD';

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
    <div className="ml-meta-screen ml-meta-screen--achievements">
      <div className="ml-meta-screen__backdrop" aria-hidden />
      <header className="ml-meta-header">
        <span className="ml-meta-header__icon" aria-hidden><JourneyAchievementGlyph /></span>
        <div className="ml-meta-header__copy">
          <small>יומן ההרפתקה</small>
          <h1>ההישגים שלי</h1>
        </div>
        <button className="ml-meta-close ml-pressable" onClick={onExit} aria-label="חזרה למפה">←</button>
      </header>

      <div className="ml-meta-content">
        <section className="ml-meta-panel">
          <div className="ml-meta-section-title">
            <span aria-hidden>✦</span>
            <h2>אולם המדליות</h2>
            <small>כל רגע אמיץ נשמר כאן</small>
          </div>
          <div className="ml-achievement-grid">
            {MEDAL_DEFS.map((m) => {
              const has = earnedIds.has(m.id);
              return (
                <div key={m.id} className={`ml-achievement-card${has ? ' is-earned' : ' is-locked'}`}>
                  <span className="ml-achievement-card__medal"><Medal tier={m.tier} size={48} /></span>
                  <div className="ml-achievement-card__copy">
                    <strong>{m.name}</strong>
                    <span>{m.desc}</span>
                    {!has && <small>🔒 עדיין נעול</small>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="ml-meta-panel">
          <div className="ml-meta-section-title">
            <span aria-hidden>🗺️</span>
            <h2>המסע בין העולמות</h2>
            <small>הדרך שלך ממשיכה להתמלא</small>
          </div>
          <div className="ml-world-goals">
            {WORLD_GOALS.map((g) => {
              const lvl = landMaxLevel(g.land);
              const pct = Math.min(1, lvl / g.targetLevel);
              const done = lvl >= g.targetLevel;
              const color = landColor(g.land);
              return (
                <div key={g.land} className={`ml-world-goal${done ? ' is-done' : ''}`} style={{ '--world-color': color } as React.CSSProperties}>
                  <span className="ml-world-goal__icon"><LandIcon land={g.land} size={48} /></span>
                  <div className="ml-world-goal__copy">
                    <strong>{LANDS[g.land].name} {done && '✓'}</strong>
                    <div className="ml-world-goal__track">
                      <div style={{ width: `${pct * 100}%` }} />
                    </div>
                    <small>רמה <span className="ltr">{lvl}/{g.targetLevel}</span></small>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Button variant="orange" size="lg" block onClick={onExit} icon="🗺️">חזרה למפה</Button>
      </div>
    </div>
  );
}
