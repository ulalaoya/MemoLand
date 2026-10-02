/* מסך סיום המסע — פשוט ונקי. ספירת מטבעות מתגלגלת, שיא אישי, ותיבת אוצר
   שנותנת צ'ופר (מטבעות בונוס). בלי נצנצים מיותרים. */
import { useEffect, useRef, useState } from 'react';
import { addCoins, useStore } from '../state/store';
import { Button } from '../components/Button';
import { Coin, Medal, StarIcon } from '../components/svg/Icons';
import './meta-screens.css';

export interface JourneyResult {
  coinsStart: number;
  coinsEnd: number;
  correct: number;
  total: number;
  bestSpan: number;
  streakDays: number;
  castleOpened: boolean;
  reachedGoal: boolean;
}

export function TreasureScreen({ result, onHome }: { result: JourneyResult; onHome: () => void }) {
  const medals = useStore((s) => s.medals);
  const [display, setDisplay] = useState(result.coinsStart);
  const [opened, setOpened] = useState(false);
  const bonusRef = useRef(20 + Math.floor(Math.random() * 30));

  // ספירת מטבעות מתגלגלת
  useEffect(() => {
    const from = result.coinsStart;
    const to = result.coinsEnd;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1000);
      setDisplay(Math.round(from + (to - from) * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [result]);

  const accuracy = result.total ? Math.round((result.correct / result.total) * 100) : 100;
  const newestMedal = medals[medals.length - 1];

  function openBox() {
    if (opened) return;
    addCoins(bonusRef.current);
    setOpened(true);
  }

  return (
    <div className="ml-treasure-finale">
      <div className="ml-treasure-finale__backdrop" aria-hidden />
      <div className="ml-treasure-finale__content">
        <span className="ml-treasure-finale__eyebrow">המסע הושלם</span>
        <h1>כבשת את המסע של היום!</h1>
        <img className="ml-treasure-finale__memo" src="./characters/memo-journey-map-wizard-v6.png" alt="" draggable={false} aria-hidden />

        {/* מטבעות מתגלגלים */}
        <div className="ml-treasure-finale__coins" aria-label={`${display} מטבעות`}>
          <Coin size={40} />
          <span className="ltr">{display}</span>
        </div>

        {/* שיא אישי */}
        <div className="ml-treasure-finale__stats">
          <Row icon={<StarIcon size={22} />} label="דיוק היום" value={`${accuracy}%`} />
          <Row icon={<span style={{ fontSize: 20 }}>🔥</span>} label="רצף ימים" value={`${result.streakDays}`} />
          {result.bestSpan > 0 && <Row icon={<Coin size={20} />} label="השיא שלך" value={`${result.bestSpan} פריטים`} />}
        </div>

        {result.castleOpened && (
          <div className="ml-treasure-finale__notice">🏰 פתחת טירה חדשה!</div>
        )}

        {newestMedal && (
          <div className="ml-treasure-finale__medal">
            <Medal tier={newestMedal.tier} size={44} />
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700 }}>מדליה חדשה!</span>
          </div>
        )}

        {/* תיבת האוצר — צ'ופר */}
        {!opened ? (
          <button className="ml-treasure-finale__chest" onClick={openBox}>
            <TreasureBox open={false} />
            <strong>הקש לפתיחת תיבת האוצר</strong>
          </button>
        ) : (
          <div className="ml-treasure-finale__chest is-open">
            <TreasureBox open />
            <strong>
              <Coin size={22} /> צ'ופר: +{bonusRef.current} מטבעות!
            </strong>
          </div>
        )}

        <Button variant="green" size="lg" block onClick={onHome} icon="🗺️">
          חזרה למפה
        </Button>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="ml-treasure-finale__stat">
      <span>
        {icon} {label}
      </span>
      <b className="ltr">{value}</b>
    </div>
  );
}

function TreasureBox({ open }: { open: boolean }) {
  return (
    <svg width={104} height={94} viewBox="0 0 110 100" aria-hidden>
      {open && [20, 45, 70, 90].map((x, i) => <circle key={x} cx={x + 5} cy={30 - (i % 2) * 12} r="4" fill="var(--gold-lite)" />)}
      <rect x="20" y="50" width="70" height="40" rx="6" fill="var(--memo-belt)" stroke="var(--ink)" strokeWidth="3" />
      <rect x="20" y="58" width="70" height="10" fill="var(--gold-deep)" stroke="var(--ink)" strokeWidth="2" />
      <path
        d={open ? 'M18 50 Q55 20 92 50 L92 40 Q55 8 18 40 Z' : 'M16 50 Q55 34 94 50 L94 44 Q55 30 16 44 Z'}
        fill="var(--ground-dk)"
        stroke="var(--ink)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="55" cy="70" r="5" fill="var(--gold)" stroke="var(--ink)" strokeWidth="2" />
    </svg>
  );
}
