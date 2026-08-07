/* מסך סיום המסע — פשוט ונקי. ספירת מטבעות מתגלגלת, שיא אישי, ותיבת אוצר
   שנותנת צ'ופר (מטבעות בונוס). בלי נצנצים מיותרים. */
import { useEffect, useRef, useState } from 'react';
import { addCoins, getActiveProfile, useStore } from '../state/store';
import { Button } from '../components/Button';
import { Coin, Medal, StarIcon } from '../components/svg/Icons';
import { Character } from '../components/svg/Memo';

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
  const profile = getActiveProfile();
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
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: 'linear-gradient(#3a2b6b,#171233)', color: '#fff', textAlign: 'center', paddingTop: 'calc(28px + var(--safe-top))' }}>
      <div style={{ padding: '0 20px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 28 }}>כבשת את המסע של היום!</h1>
        {profile && <Character kind={profile.avatar} size={116} bounce />}

        {/* מטבעות מתגלגלים */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-display)', fontSize: 44 }}>
          <Coin size={40} />
          <span className="ltr">{display}</span>
        </div>

        {/* שיא אישי */}
        <div style={{ background: 'rgba(255,255,255,.12)', borderRadius: 18, padding: 16, width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Row icon={<StarIcon size={22} />} label="דיוק היום" value={`${accuracy}%`} />
          <Row icon={<span style={{ fontSize: 20 }}>🔥</span>} label="רצף ימים" value={`${result.streakDays}`} />
          {result.bestSpan > 0 && <Row icon={<Coin size={20} />} label="השיא שלך" value={`${result.bestSpan} פריטים`} />}
        </div>

        {result.castleOpened && (
          <div style={{ fontSize: 22, fontFamily: 'var(--font-head)', fontWeight: 700 }}>🏰 פתחת טירה חדשה!</div>
        )}

        {newestMedal && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Medal tier={newestMedal.tier} size={44} />
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700 }}>מדליה חדשה!</span>
          </div>
        )}

        {/* תיבת האוצר — צ'ופר */}
        {!opened ? (
          <button onClick={openBox} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <TreasureBox open={false} />
            <div style={{ color: '#fff', fontFamily: 'var(--font-head)', fontWeight: 700, marginTop: 6 }}>הקש לפתיחת תיבת האוצר</div>
          </button>
        ) : (
          <div style={{ animation: 'pop .4s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <TreasureBox open />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-head)', fontWeight: 700 }}>
              <Coin size={22} /> צ'ופר: +{bonusRef.current} מטבעות!
            </div>
          </div>
        )}

        <Button variant="green" size="lg" onClick={onHome} icon="🏠" style={{ marginTop: 8 }}>
          חזרה למפה
        </Button>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
