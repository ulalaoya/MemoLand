/* רכיבי עזר משותפים למשחקים: מקלדת מספרים, כפתור "השמע שוב",
   באנר משוב חיובי. לעולם לא נאמר "טעות". */
import { useState } from 'react';
import { Button } from '../Button';
import { StarIcon } from '../svg/Icons';
import type { MultiplicationAttemptInput } from '../../types';
import { CalculatorKeypad } from './CalculatorKeypad';
import './common-game-ui.css';

/** תוצאה שכל משחק מדווח למעלה. */
export interface GameResult {
  correct: boolean;
  rtMs: number;
  span?: number;
  multiplicationAttempts?: MultiplicationAttemptInput[];
  /** מסיים את הניסיון השגוי ועובר לאתגר חדש מאותו מנוע, בלי להיתקע על אותה שאלה. */
  newChallengeAfterIncorrect?: boolean;
}

export interface GameProps {
  color: string;
  speechRate: number;
  hintMode: boolean; // אחרי 2 טעויות — הקלה/רמז
  onResult: (r: GameResult) => void;
}

/** מקלדת מספרים לקלט רצף/תשובה. */
export function NumberPad({
  onDigit,
  onBackspace,
  onSubmit,
  submitDisabled,
  color,
}: {
  onDigit: (d: number) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  submitDisabled?: boolean;
  color: string;
}) {
  return (
    <CalculatorKeypad
      theme="city"
      onDigit={onDigit}
      onBackspace={onBackspace}
      onSubmit={onSubmit}
      submitDisabled={submitDisabled}
      style={{ '--submit-top': color, '--submit-bottom': color } as React.CSSProperties}
    />
  );
}

/** כפתור "השמע שוב" — מוגבל למספר השמעות (2 בתרגילי זיכרון). */
export function ReplayButton({ onReplay, limit = 2 }: { onReplay: () => void; limit?: number }) {
  const [used, setUsed] = useState(0);
  const left = limit - used;
  return (
    <Button
      variant="orange"
      disabled={left <= 0}
      onClick={() => {
        setUsed((u) => u + 1);
        onReplay();
      }}
      style={{ opacity: left <= 0 ? 0.5 : 1 }}
    >
      🔊 השמע שוב {left > 0 ? `(${left})` : ''}
    </Button>
  );
}

/** באנר משוב — חיובי תמיד. */
export function FeedbackBanner({ correct, hint }: { correct: boolean; hint?: string }) {
  return (
    <div className={`ml-adventure-feedback ${correct ? 'is-correct' : 'is-guided'}`} role="status">
      <span className="ml-adventure-feedback__seal" aria-hidden>
        {correct ? <StarIcon size={28} /> : '✦'}
      </span>
      <span>{correct ? 'מעולה! ממשיכים במסע' : hint ?? 'כמעט! הדרך כבר מתבהרת'}</span>
    </div>
  );
}

/** תצוגת רצף שהוקלד (כנקודות/ספרות). */
export function EnteredDigits({ digits }: { digits: number[] }) {
  return (
    <div dir="ltr" style={{ display: 'flex', gap: 8, justifyContent: 'center', minHeight: 44 }}>
      {digits.length === 0 && <span style={{ color: 'var(--gray-300)', fontSize: 30 }}>•••</span>}
      {digits.map((d, i) => (
        <span
          key={i}
          className="display"
          style={{
            fontSize: 30,
            width: 36,
            height: 44,
            display: 'grid',
            placeItems: 'center',
            background: 'var(--panel)',
            border: '2px solid var(--gray-300)',
            borderRadius: 10,
          }}
        >
          {d}
        </span>
      ))}
    </div>
  );
}
