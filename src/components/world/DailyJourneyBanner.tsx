import type { DailyJourneyStatus } from '../../types';

interface DailyJourneyBannerProps {
  todayPoints: number;
  dailyGoal: number;
  status: DailyJourneyStatus;
  currentActivity: number;
  onStart: () => void;
}

export function DailyJourneyBanner({ todayPoints, dailyGoal, status, onStart }: DailyJourneyBannerProps) {
  const progress = Math.max(0, Math.min(1, todayPoints / dailyGoal));
  const completed = status === 'completed';
  const action = status === 'in-progress' ? 'ממשיכים במסע' : 'מתחילים מסע יומי';
  const title = completed
    ? 'המסע הושלם. לאן בא לך ללכת עכשיו?'
    : status === 'in-progress'
      ? 'המסע ממשיך מכאן'
      : 'המסע של היום';
  const description = completed
    ? 'כל העולמות פתוחים למשחק חופשי.'
    : null;

  return (
    <button
      type="button"
      className={`ml-daily-journey ml-pressable${completed ? ' is-completed' : ''}`}
      onClick={completed ? undefined : onStart}
      disabled={completed}
      aria-label={completed ? 'המסע של היום הושלם' : action}
    >
      <span className="ml-daily-journey__art" aria-hidden>
        <img src="./characters/memo-journey-map-wizard-v6.png" alt="" draggable={false} />
        <span className="ml-daily-journey__spark ml-daily-journey__spark--one">✦</span>
        <span className="ml-daily-journey__spark ml-daily-journey__spark--two">✦</span>
        <span className="ml-daily-journey__spark ml-daily-journey__spark--three">✦</span>
      </span>

      <span className="ml-daily-journey__copy">
        <span className="ml-daily-journey__eyebrow">מפת ההרפתקה</span>
        <strong>{title}</strong>
        {description ? <span className="ml-daily-journey__description">{description}</span> : null}
        <span className="ml-daily-journey__progress" aria-label={`${todayPoints} מתוך ${dailyGoal} נקודות היום`}>
          <span className="ml-daily-journey__track" aria-hidden>
            <span style={{ width: `${progress * 100}%` }} />
          </span>
          <small className="ml-number-text">{todayPoints}/{dailyGoal}</small>
        </span>
      </span>

      <span className="ml-daily-journey__button" aria-hidden>
        <span>{completed ? 'בחרו עולם' : action}</span>
        <span className="ml-daily-journey__arrow" aria-hidden>{completed ? '✓' : '←'}</span>
      </span>
    </button>
  );
}
