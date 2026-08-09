import type { ReactNode } from 'react';
import { MemoCompanion, type MemoBehavior } from './MemoCompanion';
import './numbers-valley-challenge.css';

export type NumbersChallengePhase = 'ready' | 'focus' | 'encoding' | 'recall' | 'success' | 'done';

const VALLEY_DIGIT_ROWS = [
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9, 0],
] as const;

export function NumbersValleyChallenge({
  phase,
  memoBeat = 0,
  children,
}: {
  phase: NumbersChallengePhase;
  memoBeat?: number;
  children: ReactNode;
}) {
  const memoBehavior: MemoBehavior =
    phase === 'focus' || phase === 'encoding'
      ? 'attentive'
      : phase === 'recall' || phase === 'done'
        ? 'thinking'
        : phase === 'success'
          ? 'success'
          : 'idle';

  return (
    <section className={`ml-numbers-challenge ml-numbers-challenge--${phase}`} aria-label="אתגר בעמק המספרים">
      <div className="ml-numbers-challenge__world" aria-hidden>
        <span className="ml-numbers-challenge__sunlight" />
        <span className="ml-numbers-challenge__trail-marker ml-numbers-challenge__trail-marker--one">1</span>
        <span className="ml-numbers-challenge__trail-marker ml-numbers-challenge__trail-marker--two">2</span>
        <span className="ml-numbers-challenge__trail-marker ml-numbers-challenge__trail-marker--three">3</span>
        <span className="ml-numbers-challenge__foreground-grass ml-numbers-challenge__foreground-grass--left" />
        <span className="ml-numbers-challenge__foreground-grass ml-numbers-challenge__foreground-grass--right" />
        <span className="ml-numbers-challenge__flower ml-numbers-challenge__flower--one" />
        <span className="ml-numbers-challenge__flower ml-numbers-challenge__flower--two" />
        <span className="ml-numbers-challenge__success-spark ml-numbers-challenge__success-spark--one">✦</span>
        <span className="ml-numbers-challenge__success-spark ml-numbers-challenge__success-spark--two">✦</span>
        <MemoCompanion
          key={`${memoBehavior}-${memoBeat}`}
          behavior={memoBehavior}
          className="ml-numbers-challenge__memo"
        />
      </div>

      <div className="ml-numbers-challenge__surface">{children}</div>
    </section>
  );
}

export function ValleyReadyButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="ml-valley-ready-button ml-pressable" onClick={onClick}>
      <span className="ml-valley-ready-button__play" aria-hidden>▶</span>
      <span>
        <strong>אני מוכן</strong>
        <small>יוצאים לדרך</small>
      </span>
    </button>
  );
}

export function ValleyNumberToken({ children }: { children: ReactNode }) {
  return (
    <div className="ml-valley-number-stage" aria-live="polite">
      <span className="ml-valley-number-stage__beam" aria-hidden />
      <span className="ml-valley-number-stage__glow" aria-hidden />
      <span className="ml-valley-number-stage__landing" aria-hidden />
      <span className="ml-valley-number-token" dir="ltr">{children}</span>
    </div>
  );
}

export function ValleyFocusBreath() {
  return (
    <div className="ml-valley-focus-breath" role="status" aria-label="המסלול מתכונן">
      <span className="ml-valley-focus-breath__ring" aria-hidden />
      <span className="ml-valley-focus-breath__stone" aria-hidden />
    </div>
  );
}

export function ValleyEnteredDigits({ digits }: { digits: number[] }) {
  return (
    <div className="ml-valley-entered" dir="ltr" aria-label="המספרים שהוזנו">
      {digits.length === 0 ? <span className="ml-valley-entered__empty">•••</span> : null}
      {digits.map((digit, index) => (
        <span key={`${digit}-${index}`} className="ml-valley-entered__stone">{digit}</span>
      ))}
    </div>
  );
}

export function ValleyNumberPad({
  onDigit,
  onBackspace,
  onSubmit,
  submitDisabled,
}: {
  onDigit: (digit: number) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  submitDisabled?: boolean;
}) {
  return (
    <div className="ml-valley-number-pad" dir="ltr">
      <div className="ml-valley-number-pad__digits">
        {VALLEY_DIGIT_ROWS.map((row, rowIndex) => (
          <div key={row[0]} className={`ml-valley-number-pad__row ml-valley-number-pad__row--${rowIndex + 1}`}>
            {row.map((digit) => (
              <button
                key={digit}
                type="button"
                className="ml-valley-key ml-pressable"
                onClick={() => onDigit(digit)}
                aria-label={`ספרה ${digit}`}
              >
                {digit}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="ml-valley-number-pad__actions">
        <button type="button" className="ml-valley-action ml-valley-action--erase ml-pressable" onClick={onBackspace} aria-label="מחק">
          <span aria-hidden>⌫</span>
          מחק
        </button>
        <button
          type="button"
          className="ml-valley-action ml-valley-action--submit ml-pressable"
          onClick={onSubmit}
          disabled={submitDisabled}
          aria-label="אישור"
        >
          <span aria-hidden>✓</span>
          ממשיכים
        </button>
      </div>
    </div>
  );
}
