import { useEffect, useRef, useState } from 'react';
import type { ExerciseId, ExerciseStats, MemoRank, Profile } from '../../types';
import { learningLevelProgress, rankLabel } from '../../state/rewards';
import { Logo } from '../Logo';
import { Coin, HeartIcon } from '../svg/Icons';
import { PlayerIdentity } from './PlayerIdentity';

interface PlayerHUDProps {
  profile: Profile | null;
  coins: number;
  rank: MemoRank;
  stats?: Record<ExerciseId, ExerciseStats>;
  equippedHat?: string;
  onSwitchProfile: () => void;
  onOpenAchievements: () => void;
  onOpenCollections: () => void;
  onOpenParent: () => void;
}

export function PlayerHUD({
  profile,
  coins,
  rank,
  stats,
  equippedHat,
  onSwitchProfile,
  onOpenAchievements,
  onOpenCollections,
  onOpenParent,
}: PlayerHUDProps) {
  const learning = learningLevelProgress(stats ?? {});
  const remainingSkill = learning.next === null ? null : Math.max(0, learning.next - learning.points);

  return (
    <section className="ml-player-hud" aria-label="מצב השחקן">
      <div className="ml-player-hud__main-row">
        <PlayerIdentity
          profile={profile}
          equippedHat={equippedHat}
          rankLabel={rankLabel(rank)}
          onSelect={onSwitchProfile}
        />

        <ParentAccessLogo onOpenParent={onOpenParent} />

        <div className="ml-player-hud__resources" aria-label="משאבים">
          <span className="ml-resource-chip ml-resource-chip--coins">
            <Coin size={24} />
            <strong className="ml-number-text">{coins}</strong>
          </span>
          <span className="ml-resource-chip" aria-label="שלושה לבבות במפה">
            {[0, 1, 2].map((heart) => (
              <HeartIcon key={heart} size={20} style={{ marginInlineStart: heart === 0 ? 0 : -4 }} />
            ))}
          </span>
        </div>
      </div>

      <div className="ml-player-hud__lower-row">
        <div className="ml-hud-progress ml-hud-progress--rank" aria-label={`רמת מיומנות ${learning.level}. ${remainingSkill === null ? 'רמה מרבית' : `עוד ${remainingSkill} נקודות מיומנות`}`}>
          <div className="ml-hud-progress__label">
            <strong>רמה {learning.level}</strong>
            <small>{remainingSkill === null ? 'רמה מרבית!' : `עוד ${remainingSkill} נק׳`}</small>
          </div>
          <ProgressTrack value={learning.ratio} />
        </div>

        <nav className="ml-player-hud__actions" aria-label="פעולות במפה">
          <HudAction label="הישגים" onClick={onOpenAchievements} icon={<JourneyAchievementGlyph />} />
          <HudAction label="אוספים" onClick={onOpenCollections} icon={<JourneyCollectionGlyph />} />
        </nav>
      </div>
    </section>
  );
}

function ParentAccessLogo({ onOpenParent }: { onOpenParent: () => void }) {
  const timer = useRef<number | null>(null);
  const [holding, setHolding] = useState(false);

  function cancelHold() {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  }

  function startHold() {
    if (timer.current !== null) return;
    setHolding(true);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setHolding(false);
      if ('vibrate' in navigator) navigator.vibrate(35);
      onOpenParent();
    }, 1200);
  }

  useEffect(() => cancelHold, []);

  return (
    <button
      type="button"
      className={`ml-player-hud__logo${holding ? ' is-holding' : ''}`}
      aria-label="MemoLand"
      onPointerDown={startHold}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') startHold();
      }}
      onKeyUp={cancelHold}
      onContextMenu={(event) => event.preventDefault()}
    >
      <Logo variant="compact" width={126} />
      <span className="ml-player-hud__parent-hold" aria-hidden>המשיכו ללחוץ…</span>
    </button>
  );
}

function ProgressTrack({ value }: { value: number }) {
  return (
    <div className="ml-hud-progress__track" aria-hidden>
      <span style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  );
}

function HudAction({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" className="ml-hud-action ml-pressable" onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function JourneyCollectionGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path d="M4 7.5 12 3l8 4.5v10L12 22l-8-4.5z" fill="#153f70" stroke="#ffe27a" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 3v19M4 7.5l8 4.5 8-4.5" fill="none" stroke="#bdeaff" strokeWidth="1.4" />
      <path d="m9.3 14.3 1.7.2.9-1.6.8 1.6 1.8.2-1.3 1.2.4 1.8-1.6-.8-1.6.8.3-1.8z" fill="#ffe16d" />
    </svg>
  );
}

export function JourneyAchievementGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path d="M7 3h10v6a5 5 0 0 1-10 0z" fill="#ffd75e" stroke="#143255" strokeWidth="1.8" />
      <path d="M7 5H3v2c0 3 2 5 5 5M17 5h4v2c0 3-2 5-5 5" fill="none" stroke="#dff3ff" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 14v4M8 21h8" stroke="#dff3ff" strokeWidth="2" strokeLinecap="round" />
      <path d="m12 5 .9 1.8 2 .3-1.5 1.4.4 2-1.8-.9-1.8.9.4-2-1.5-1.4 2-.3z" fill="#fff5c7" />
    </svg>
  );
}
