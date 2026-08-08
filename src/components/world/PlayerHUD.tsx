import type { MemoRank, Profile } from '../../types';
import { rankLabel, rankProgress } from '../../state/rewards';
import { Logo } from '../Logo';
import { Coin, HeartIcon, TrophyIcon } from '../svg/Icons';
import { PlayerIdentity } from './PlayerIdentity';

interface PlayerHUDProps {
  profile: Profile | null;
  coins: number;
  rank: MemoRank;
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
  equippedHat,
  onSwitchProfile,
  onOpenAchievements,
  onOpenCollections,
  onOpenParent,
}: PlayerHUDProps) {
  const rankState = rankProgress(coins);
  const remainingCoins = rankState.next === null ? null : Math.max(0, rankState.next - coins);

  return (
    <section className="ml-player-hud" aria-label="מצב השחקן">
      <div className="ml-player-hud__main-row">
        <PlayerIdentity
          profile={profile}
          equippedHat={equippedHat}
          rankLabel={rankLabel(rank)}
          onSelect={onSwitchProfile}
        />

        <div className="ml-player-hud__logo" aria-label="MemoLand">
          <Logo variant="compact" width={126} />
        </div>

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
        <div className="ml-hud-progress ml-hud-progress--rank" aria-label={`התקדמות בדרגה. ${remainingCoins === null ? 'דרגת שיא' : `עוד ${remainingCoins} מטבעות`}`}>
          <div className="ml-hud-progress__label">
            <strong>התקדמות</strong>
            <small>{remainingCoins === null ? 'דרגת שיא!' : `עוד ${remainingCoins}`}</small>
          </div>
          <ProgressTrack value={rankState.ratio} />
        </div>

        <nav className="ml-player-hud__actions" aria-label="פעולות במפה">
          <HudAction label="הישגים" onClick={onOpenAchievements} icon={<TrophyIcon size={20} />} />
          <HudAction label="אוספים" onClick={onOpenCollections} icon={<CollectionGlyph />} />
          <HudAction label="הורים" onClick={onOpenParent} icon={<ParentGlyph />} />
        </nav>
      </div>
    </section>
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

function CollectionGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path d="M5 8.5h14v11H5z" fill="var(--ml-purple)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 8.5V6.8A4 4 0 0112 3a4 4 0 014 3.8v1.7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8.5 13h7" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ParentGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <circle cx="9" cy="8" r="3" fill="var(--ml-blue)" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16.5" cy="9" r="2.4" fill="var(--ml-yellow)" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 20c.4-4.3 2.3-6.4 5.5-6.4s5.1 2.1 5.5 6.4M13 19.8c.3-3.2 1.5-4.8 3.7-4.8 2.1 0 3.4 1.6 3.8 4.8" fill="var(--ml-surface)" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
