interface DailyJourneyBannerProps {
  onStart: () => void;
}

export function DailyJourneyBanner({ onStart }: DailyJourneyBannerProps) {
  return (
    <section className="ml-daily-journey" aria-label="המסע של היום">
      <div className="ml-daily-journey__art" aria-hidden>
        <JourneyCompass />
        <span className="ml-daily-journey__spark ml-daily-journey__spark--one">✦</span>
        <span className="ml-daily-journey__spark ml-daily-journey__spark--two">✦</span>
      </div>

      <div className="ml-daily-journey__copy">
        <span className="ml-daily-journey__eyebrow">משימה חדשה מחכה</span>
        <strong>המסע של היום</strong>
        <small>משחקים קצרים, הפתעות ופרס יומי</small>
      </div>

      <button type="button" className="ml-daily-journey__button ml-pressable" onClick={onStart}>
        <span>יוצאים לדרך</span>
        <span className="ml-daily-journey__arrow" aria-hidden>←</span>
      </button>
    </section>
  );
}

function JourneyCompass() {
  return (
    <svg className="ml-daily-journey__compass" viewBox="0 0 96 96" role="img" aria-label="מצפן ומפת מסע">
      <path d="M18 27l21-9 20 8 20-8v50l-20 9-20-8-21 9z" fill="#fff" opacity=".96" stroke="#2f245b" strokeWidth="4" strokeLinejoin="round" />
      <path d="M39 18v51M59 26v51" fill="none" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />
      <path d="M26 53c10-13 19-7 29-16 7-6 12-4 17-11" fill="none" stroke="#ff6a89" strokeWidth="4" strokeLinecap="round" strokeDasharray="5 7" />
      <circle cx="29" cy="54" r="5" fill="#ffd84d" stroke="#2f245b" strokeWidth="3" />
      <g transform="translate(55 44)">
        <circle cx="17" cy="17" r="17" fill="#7bdcff" stroke="#2f245b" strokeWidth="4" />
        <circle cx="17" cy="17" r="11" fill="#fff" />
        <path d="M21 12l-3 7-7 3 3-7z" fill="#ff5f7f" stroke="#2f245b" strokeWidth="2" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
