/* מסך סיום המסע — פשוט ונקי. ספירת מטבעות מתגלגלת, שיא אישי, ותיבת אוצר
   שנותנת צ'ופר (מטבעות בונוס). בלי נצנצים מיותרים. */
import { useRef, useState } from 'react';
import { addCoins, getState, useProfiles, useStore } from '../state/store';
import { Coin, Medal, StarIcon } from '../components/svg/Icons';
import { Character } from '../components/svg/Memo';
import type { LandId } from '../types';
import {
  CoinRewardExperience,
  createCoinRewardEvent,
  type CoinRewardEvent,
} from '../components/CoinRewardExperience';
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
  completionKind: 'daily' | 'world';
  landId: LandId;
}

export function TreasureScreen({ result, onHome }: { result: JourneyResult; onHome: () => void }) {
  const avatar = useProfiles((registry) => (
    registry.profiles.find((profile) => profile.id === registry.activeId)?.avatar ?? 'memo'
  ));
  const medals = useStore((s) => s.medals);
  const coins = useStore((s) => s.coins);
  const [opened, setOpened] = useState(false);
  const [chestReward, setChestReward] = useState<CoinRewardEvent | null>(null);
  const openedRef = useRef(false);
  const bonusRef = useRef(20 + Math.floor(Math.random() * 30));
  const chestRef = useRef<HTMLDivElement>(null);

  const accuracy = result.total ? Math.round((result.correct / result.total) * 100) : 100;
  const newestMedal = medals[medals.length - 1];

  function openBox() {
    if (openedRef.current) return;
    openedRef.current = true;
    const before = getState().coins;
    addCoins(bonusRef.current);
    const after = getState().coins;
    setChestReward(createCoinRewardEvent(1, before, after));
    setOpened(true);
  }

  function returnToMap() {
    try {
      sessionStorage.setItem('memoland.map-return-land', result.landId);
    } catch {
      // Navigation still works if storage is unavailable.
    }
    onHome();
  }

  return (
    <div className="ml-treasure-finale">
      <div className="ml-treasure-finale__backdrop" aria-hidden />
      <div className="ml-treasure-finale__content">
        <span className="ml-treasure-finale__eyebrow">
          {result.completionKind === 'daily' ? 'המסע היומי הושלם' : 'עוד תחנה הושלמה'}
        </span>
        <h1>
          {result.completionKind === 'daily'
            ? 'כבשת את המסע של היום!'
            : 'כל הכבוד — סיימת עוד מסלול בדרך למסע היומי!'}
        </h1>
        <div className="ml-treasure-finale__memo" aria-hidden><Character kind={avatar} size={150} /></div>

        {/* מטבעות מתגלגלים */}
        <div className="ml-treasure-finale__coins" aria-label={`${coins} מטבעות`}>
          <span className="ml-treasure-finale__coin-bag" aria-hidden>💰</span>
          <CoinRewardExperience total={coins} reward={chestReward} sourceRef={chestRef} />
        </div>

        {/* שיא אישי */}
        <div className="ml-treasure-finale__stats">
          <Row icon={<StarIcon size={22} />} label="דיוק היום" value={`${accuracy}%`} />
          <Row icon={<span style={{ fontSize: 20 }}>🔥</span>} label="רצף יומי" value={`${result.streakDays} ימים`} />
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
        <div ref={chestRef} className="ml-treasure-finale__chest-stage">
          {!opened ? (
            <button className="ml-treasure-finale__chest ml-pressable" onClick={openBox}>
              <TreasureBox open={false} />
              <strong>פותחים את אוצר המסע</strong>
            </button>
          ) : (
            <div className="ml-treasure-finale__chest is-open">
              <TreasureBox open />
              <strong>
                <Coin size={22} /> +{bonusRef.current} מטבעות נערמו בשק!
              </strong>
            </div>
          )}
        </div>

        <button type="button" className="ml-treasure-finale__home ml-pressable" onClick={returnToMap}>
          <span aria-hidden>🗺️</span>
          <strong>חזרה למפת ההרפתקה</strong>
          <span aria-hidden>←</span>
        </button>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="ml-treasure-finale__stat">
      <span className="ml-treasure-finale__stat-icon" aria-hidden>{icon}</span>
      <span className="ml-treasure-finale__stat-copy"><small>{label}</small><b className="ltr">{value}</b></span>
    </div>
  );
}

function TreasureBox({ open }: { open: boolean }) {
  return (
    <svg className={`ml-magic-chest${open ? ' is-open' : ''}`} width={168} height={138} viewBox="0 0 180 150" aria-hidden>
      <defs>
        <linearGradient id="ml-chest-wood" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#9b4f36"/><stop offset="1" stopColor="#3f1d2a"/></linearGradient>
        <linearGradient id="ml-chest-gold" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fff0a0"/><stop offset=".48" stopColor="#e8ae34"/><stop offset="1" stopColor="#8d5319"/></linearGradient>
        <radialGradient id="ml-chest-glow"><stop stopColor="#fff6b0" stopOpacity=".95"/><stop offset="1" stopColor="#5de3ff" stopOpacity="0"/></radialGradient>
      </defs>
      <ellipse className="ml-magic-chest__glow" cx="90" cy="70" rx="76" ry="62" fill="url(#ml-chest-glow)" />
      <g className="ml-magic-chest__lid">
        <path d="M24 72V55C24 24 48 12 90 12s66 12 66 43v17Z" fill="url(#ml-chest-wood)" stroke="#f7cf62" strokeWidth="6" />
        <path d="M34 55c7-22 26-30 56-30s49 8 56 30" fill="none" stroke="url(#ml-chest-gold)" strokeWidth="10" />
        <path d="M90 17v53M49 29v42M131 29v42" stroke="#d9972f" strokeWidth="5" opacity=".86" />
      </g>
      <path d="M20 69h140v63c0 7-6 12-13 12H33c-7 0-13-5-13-12Z" fill="url(#ml-chest-wood)" stroke="#f7cf62" strokeWidth="6" />
      <path d="M24 83h132M38 70v70M142 70v70" stroke="url(#ml-chest-gold)" strokeWidth="9" />
      <path d="M77 83h26v34c0 8-5 14-13 18-8-4-13-10-13-18Z" fill="#17385f" stroke="#ffe180" strokeWidth="5" />
      <circle cx="90" cy="103" r="6" fill="#61e0ff" stroke="#fff3a4" strokeWidth="3" />
      <path d="m90 94 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="#fff3a4" />
      {open ? <g className="ml-magic-chest__sparks"><path d="M29 34h14M36 27v14M145 32h12M151 26v12M84 5h12M90 0v12" stroke="#fff0a0" strokeWidth="4" strokeLinecap="round" /></g> : null}
    </svg>
  );
}
