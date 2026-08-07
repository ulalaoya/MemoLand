/* מסך סיום המסע — ספירת מטבעות מתגלגלת, זיקוקים, "השיא החדש שלך",
   משפט אישי, ותיבת אוצר שנפתחת (מטבעות + קישוט אקראי). */
import { useEffect, useMemo, useRef, useState } from 'react';
import { addCoins, addCosmetic, useStore } from '../state/store';
import { Button } from '../components/Button';
import { Coin, PartyIcon, StarIcon, Medal } from '../components/svg/Icons';
import { Memo } from '../components/svg/Memo';
import { sfxFanfare } from '../audio/sfx';

const HATS = [
  { id: 'hat-crown', name: 'כתר זהב', kind: 'hat' as const },
  { id: 'hat-cap', name: 'כובע מצחייה', kind: 'hat' as const },
  { id: 'bg-rainbow', name: 'רקע קשת', kind: 'background' as const },
  { id: 'color-neon', name: 'צבע ניאון', kind: 'color' as const },
];

export interface JourneyResult {
  coinsStart: number;
  coinsEnd: number;
  correct: number;
  total: number;
  bestSpan: number;
  streakDays: number;
  castleOpened: boolean;
}

export function TreasureScreen({ result, onHome }: { result: JourneyResult; onHome: () => void }) {
  const rank = useStore((s) => s.rank);
  const medals = useStore((s) => s.medals);
  const [display, setDisplay] = useState(result.coinsStart);
  const [opened, setOpened] = useState(false);
  const bonus = useMemo(() => 20 + Math.floor(Math.random() * 30), []);
  const gift = useMemo(() => HATS[Math.floor(Math.random() * HATS.length)], []);
  const firedRef = useRef(false);

  // ספירת מטבעות מתגלגלת
  useEffect(() => {
    const from = result.coinsStart;
    const to = result.coinsEnd;
    const dur = 1200;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setDisplay(Math.round(from + (to - from) * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    if (!firedRef.current) {
      firedRef.current = true;
      sfxFanfare();
    }
    return () => cancelAnimationFrame(raf);
  }, [result]);

  const accuracy = result.total ? Math.round((result.correct / result.total) * 100) : 100;
  const newestMedal = medals[medals.length - 1];

  function openBox() {
    if (opened) return;
    addCoins(bonus);
    addCosmetic({ id: gift.id, kind: gift.kind, name: gift.name });
    setOpened(true);
    sfxFanfare();
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: 'linear-gradient(#3a2b6b,#171233)', color: '#fff', textAlign: 'center', paddingTop: 'calc(24px + var(--safe-top))' }}>
      <Fireworks />
      <div style={{ position: 'relative', zIndex: 2, padding: '0 18px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 30 }}>כבשת את המסע של היום!</h1>
        <Memo size={130} rank={rank} bounce />

        {/* מטבעות מתגלגלים */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-display)', fontSize: 44 }}>
          <Coin size={40} spin />
          <span className="ltr">{display}</span>
        </div>

        {/* שיא אישי ומשפט */}
        <div style={{ background: 'rgba(255,255,255,.12)', borderRadius: 18, padding: 16, width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Row icon={<StarIcon size={22} />} label="דיוק היום" value={`${accuracy}%`} />
          <Row icon={<span style={{ fontSize: 20 }}>🔥</span>} label="רצף ימים" value={`${result.streakDays}`} />
          {result.bestSpan > 0 && <Row icon={<PartyIcon size={22} />} label="השיא שלך" value={`${result.bestSpan} פריטים`} />}
          {result.bestSpan > 0 && (
            <p style={{ margin: 0, opacity: 0.9, fontFamily: 'var(--font-body)' }}>
              היום זכרת <b className="ltr">{result.bestSpan}</b> פריטים — כל הכבוד!
            </p>
          )}
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

        {/* תיבת האוצר */}
        {!opened ? (
          <button onClick={openBox} style={{ background: 'none', border: 'none', cursor: 'pointer', animation: 'memo-bounce 1.4s infinite' }}>
            <TreasureBox open={false} />
            <div style={{ color: '#fff', fontFamily: 'var(--font-head)', fontWeight: 700, marginTop: 6 }}>הקש לפתיחת תיבת האוצר</div>
          </button>
        ) : (
          <div style={{ animation: 'pop .4s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <TreasureBox open />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-head)', fontWeight: 700 }}>
              <Coin size={22} /> +{bonus} מטבעות
            </div>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700 }}>🎁 {gift.name}!</div>
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
    <svg width={110} height={100} viewBox="0 0 110 100" aria-hidden>
      {open && (
        <g>
          {[20, 45, 70, 90].map((x, i) => (
            <circle key={x} cx={x + 5} cy={30 - (i % 2) * 12} r="4" fill="var(--gold-lite)" />
          ))}
        </g>
      )}
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

function Fireworks() {
  const bursts = useMemo(
    () => Array.from({ length: 6 }, (_, i) => ({ x: 15 + (i * 70) / 6 + Math.random() * 20, y: 15 + Math.random() * 30, d: Math.random() * 1.5, c: ['#F7C93B', '#F04A3A', '#7FD341', '#2E8DF6', '#8C52D9'][i % 5] })),
    [],
  );
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      {bursts.map((b, i) => (
        <g key={i} style={{ transformOrigin: `${b.x}px ${b.y}px`, animation: `pop 1.2s ease ${b.d}s infinite` }}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1={b.x} y1={b.y} x2={b.x + Math.cos((a * Math.PI) / 180) * 6} y2={b.y + Math.sin((a * Math.PI) / 180) * 6} stroke={b.c} strokeWidth="0.8" strokeLinecap="round" />
          ))}
        </g>
      ))}
    </svg>
  );
}
