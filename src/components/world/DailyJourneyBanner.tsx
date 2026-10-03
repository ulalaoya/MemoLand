import type { DailyJourneyStatus } from '../../types';

interface DailyJourneyBannerProps {
  todayPoints: number;
  dailyGoal: number;
  status: DailyJourneyStatus;
  currentActivity: number;
  onStart: () => void;
}

export function DailyJourneyBanner({ todayPoints, dailyGoal, status, onStart }: DailyJourneyBannerProps) {
  const completed = status === 'completed';
  const progress = completed ? 1 : Math.max(0, Math.min(1, todayPoints / dailyGoal));
  const action = status === 'in-progress' ? 'ממשיכים במסע' : 'מתחילים מסע יומי';
  const title = completed
    ? 'המסע הושלם!'
    : status === 'in-progress'
      ? 'המסע ממשיך מכאן'
      : 'המסע של היום';
  const description = completed
    ? 'לאן ממשיכים עכשיו?'
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
        <span className="ml-daily-journey__progress" aria-label={completed ? 'המסע היומי הושלם במלואו' : `${todayPoints} מתוך ${dailyGoal} נקודות היום`}>
          <span className="ml-daily-journey__track" aria-hidden>
            <span style={{ width: `${progress * 100}%` }} />
          </span>
          <small className="ml-number-text">{completed ? 'הושלם ✓' : `${todayPoints}/${dailyGoal}`}</small>
        </span>
      </span>

      <span className="ml-daily-journey__button" aria-hidden>
        <span>{completed ? 'בחרו עולם' : action}</span>
        <span className="ml-daily-journey__arrow" aria-hidden>{completed ? '✓' : '←'}</span>
      </span>
    </button>
  );
}
