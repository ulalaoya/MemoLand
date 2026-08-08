import type { Profile } from '../../types';
import { Character } from '../svg/Memo';

interface PlayerIdentityProps {
  profile: Profile | null;
  equippedHat?: string;
  rankLabel: string;
  onSelect: () => void;
}

export function PlayerIdentity({ profile, equippedHat, rankLabel, onSelect }: PlayerIdentityProps) {
  return (
    <button
      type="button"
      className="ml-player-identity ml-pressable"
      onClick={onSelect}
      aria-label={`זהות השחקן${profile?.name ? `, ${profile.name}` : ''}. לחצו להחלפת שחקן`}
    >
      <span className="ml-player-identity__portrait">
        {profile ? (
          <Character
            kind={profile.avatar}
            size={48}
            hat={equippedHat}
            ring="rgba(255, 255, 255, 0.96)"
            style={{ borderRadius: '50%', background: 'linear-gradient(145deg, #dff3ff, #ffffff)' }}
          />
        ) : null}
        <span className="ml-player-identity__level" aria-hidden>✦</span>
      </span>
      <span className="ml-player-identity__copy">
        <strong>{profile?.name ?? 'שחקן'}</strong>
        <small>{rankLabel}</small>
      </span>
      <span className="ml-player-identity__chevron" aria-hidden>⌄</span>
    </button>
  );
}
