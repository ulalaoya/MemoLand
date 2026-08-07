/* שאלת בחירה מרובה — לשליפה מושהית, "מה שזכרת אתמול", וסיפורי מערת ההדים. */
import { useEffect, useRef, useState } from 'react';
import { speak } from '../../audio/speech';
import { Button } from '../Button';
import { FeedbackBanner } from './common';

export function QuizGame({
  question,
  answer,
  options,
  color,
  speechRate,
  onResult,
}: {
  question: string;
  answer: string;
  options: string[];
  color: string;
  speechRate: number;
  onResult: (correct: boolean) => void;
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  const startRef = useRef(performance.now());

  useEffect(() => {
    speak(question, speechRate);
    startRef.current = performance.now();
  }, [question, speechRate]);

  function pick(opt: string) {
    if (chosen) return;
    const correct = opt === answer;
    setChosen(opt);
    setTimeout(() => onResult(correct), 1300);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      <p style={{ fontSize: 24, fontFamily: 'var(--font-head)', fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>{question}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320 }}>
        {options.map((opt) => {
          const isChosen = chosen === opt;
          const isAnswer = opt === answer;
          const bg = chosen ? (isAnswer ? 'var(--btn-green)' : isChosen ? color : 'var(--panel)') : 'var(--panel)';
          const fg = chosen && (isAnswer || isChosen) ? '#fff' : 'var(--ink)';
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              style={{
                fontFamily: 'var(--font-head)',
                fontWeight: 600,
                fontSize: 18,
                padding: '14px 18px',
                borderRadius: 14,
                border: '2px solid var(--gray-300)',
                background: bg,
                color: fg,
                boxShadow: '0 3px 0 rgba(36,50,71,.15)',
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {chosen && <FeedbackBanner correct={chosen === answer} hint="כמעט! הנה התשובה הנכונה" />}
      {!chosen && (
        <Button variant="orange" onClick={() => speak(question, speechRate)}>
          🔊 שמע שוב
        </Button>
      )}
    </div>
  );
}
