/* רכיבי עזר משותפים למשחקים: מקלדת מספרים, כפתור "השמע שוב",
   באנר משוב חיובי. לעולם לא נאמר "טעות". */
import { useState } from 'react';
import { Button } from '../Button';
import { StarIcon } from '../svg/Icons';
import type { MultiplicationAttemptInput } from '../../types';

/** תוצאה שכל משחק מדווח למעלה. */
export interface GameResult {
  correct: boolean;
  rtMs: number;
  span?: number;
  multiplicationAttempts?: MultiplicationAttemptInput[];
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
  const keyStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 28,
    background: 'var(--panel)',
    color: 'var(--ink)',
    border: '2px solid var(--gray-300)',
    borderRadius: 14,
    padding: '14px 0',
    boxShadow: '0 3px 0 rgba(36,50,71,.2)',
    cursor: 'pointer',
  };
  return (
    <div style={{ width: '100%', maxWidth: 320, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }} dir="ltr">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <button key={d} style={keyStyle} onClick={() => onDigit(d)} aria-label={`ספרה ${d}`}>
            {d}
          </button>
        ))}
        <button style={{ ...keyStyle, fontSize: 20, color: 'var(--btn-orange)' }} onClick={onBackspace} aria-label="מחק">
          ⌫
        </button>
        <button style={keyStyle} onClick={() => onDigit(0)} aria-label="ספרה 0">
          0
        </button>
        <button
          style={{ ...keyStyle, background: color, color: '#fff', border: '2px solid #fff' }}
          onClick={onSubmit}
          disabled={submitDisabled}
          aria-label="אישור"
        >
          ✓
        </button>
      </div>
    </div>
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
    <div
      style={{
        animation: 'pop .3s ease',
        background: correct ? 'var(--btn-green)' : 'var(--panel)',
        color: correct ? '#fff' : 'var(--ink)',
        border: `3px solid ${correct ? '#fff' : 'var(--gray-300)'}`,
        borderRadius: 16,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: 'var(--font-head)',
        fontWeight: 700,
        fontSize: 20,
        boxShadow: 'var(--btn-shadow)',
      }}
    >
      {correct ? <StarIcon size={26} /> : null}
      <span>{correct ? 'יפה מאוד! ' : hint ?? 'כמעט! בוא ננסה עוד פעם'}</span>
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
