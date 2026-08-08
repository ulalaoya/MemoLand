import type { CSSProperties } from 'react';
import type { LandId } from '../../types';
import type { LandVisualTheme } from '../../design/themes';
import { FlagIcon } from '../svg/Icons';
import { WorldIllustration } from './WorldIllustrations';

interface LandCardProps {
  landId: LandId;
  worldNumber: number;
  name: string;
  subtitle: string;
  completedTracks: number;
  totalTracks: number;
  castleOpen: boolean;
  available: boolean;
  current: boolean;
  side: 'left' | 'right';
  theme: LandVisualTheme;
  onSelect: () => void;
}

export function LandCard({
  landId,
  worldNumber,
  name,
  subtitle,
  completedTracks,
  totalTracks,
  castleOpen,
  available,
  current,
  side,
  theme,
  onSelect,
}: LandCardProps) {
  const progress = Math.max(0, Math.min(1, completedTracks / totalTracks));
  const style = {
    '--land-primary': theme.primary,
    '--land-secondary': theme.secondary,
    '--land-accent': theme.accent,
    '--land-surface': theme.surface,
    '--land-border': theme.cardBorder,
    '--land-glow': theme.glow,
  } as CSSProperties;

  return (
    <article className={`ml-land-row ml-land-row--${side}`} style={style}>
      <button
        type="button"
        className={`ml-land-card ml-pressable${current ? ' ml-land-card--current' : ''}`}
        onClick={onSelect}
        disabled={!available}
        aria-label={`${name}, עולם ${worldNumber}, ${completedTracks} מתוך ${totalTracks} מסלולים${available ? '' : ', לא זמין'}`}
      >
        <span className="ml-land-card__art" aria-hidden>
          <WorldIllustration land={landId} />
          <span className="ml-land-card__world-number ml-display-text">{worldNumber}</span>
        </span>

        <span className="ml-land-card__content">
          <span className="ml-land-card__eyebrow">
            {current ? 'התחנה הבאה' : available ? 'עולם פתוח' : 'עולם נעול'}
          </span>
          <strong className="ml-land-card__title">{name}</strong>
          <span className="ml-land-card__subtitle">{subtitle}</span>

          <span className="ml-land-card__progress-row">
            <span className="ml-land-card__progress-track" aria-hidden>
              <span style={{ width: `${progress * 100}%` }} />
            </span>
            <span className="ml-land-card__progress-value ml-number-text">
              <FlagIcon size={16} /> {completedTracks}/{totalTracks}
            </span>
          </span>
        </span>

        {castleOpen ? <span className="ml-land-card__castle" aria-label="הטירה פתוחה">♛</span> : null}
      </button>

      <span
        className={`ml-route-checkpoint${current ? ' ml-route-checkpoint--current' : ''}${available ? ' ml-route-checkpoint--available' : ''}`}
        aria-hidden
      >
        <span>{worldNumber}</span>
      </span>
    </article>
  );
}
