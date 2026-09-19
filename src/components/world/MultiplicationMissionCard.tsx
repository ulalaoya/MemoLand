import type { MultiplicationProgress } from '../../types';
import {
  MULTIPLICATION_PRACTICE_FACTS,
  isMultiplicationFactMastered,
  multiplicationMasteryCount,
  multiplicationSuccessesNeeded,
} from '../../learning/multiplicationFacts';

const MISSION_DEADLINE = { year: 2026, month: 10, day: 4 };

function daysUntilDeadline(now = new Date()): number {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const deadline = Date.UTC(MISSION_DEADLINE.year, MISSION_DEADLINE.month - 1, MISSION_DEADLINE.day);
  return Math.max(0, Math.ceil((deadline - today) / 86_400_000));
}

export function MultiplicationMissionCard({
  progress,
  onPractice,
}: {
  progress: MultiplicationProgress;
  onPractice: () => void;
}) {
  const mastered = multiplicationMasteryCount(progress);
  const total = MULTIPLICATION_PRACTICE_FACTS.length;
  const remaining = total - mastered;
  const daysLeft = daysUntilDeadline();
  const orderedFacts = [...MULTIPLICATION_PRACTICE_FACTS].sort((a, b) => a.a - b.a || a.b - b.b);

  return (
    <section className="ml-multiplication-mission" aria-label="מבצע לוח הכפל">
      <div className="ml-multiplication-mission__eyebrow">
        <span>⭐ משימת הכפל שלך</span>
        <span>יעד: 4.10</span>
      </div>
      <h2>{remaining === 0 ? 'מבצע לוח הכפל הושלם!' : 'בואו נכבוש את לוח הכפל!'}</h2>
      <p>
        {remaining === 0
          ? 'כל המכפלות כבר בזיכרון. כל הכבוד!'
          : `מתרגלים כמה שרוצים. מכפלות של 1 משלימים בתשובה נכונה אחת; את השאר בחמש תשובות נכונות ברצף בלי רמז. ${daysLeft > 0 ? `נותרו ${daysLeft} ימים ליעד.` : 'ממשיכים יחד עד שמסיימים.'}`}
      </p>
      <div className="ml-multiplication-mission__meter-label">
        <strong>{mastered} מתוך {total} מכפלות הושלמו</strong>
        <span>{remaining === 0 ? 'הכול הושלם!' : `עוד ${remaining} לכבוש`}</span>
      </div>
      <div
        className="ml-multiplication-mission__meter"
        role="progressbar"
        aria-label="התקדמות במבצע לוח הכפל"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={mastered}
      >
        <span style={{ width: `${(mastered / total) * 100}%` }} />
      </div>
      <button className="ml-multiplication-mission__play ml-pressable" type="button" onClick={onPractice}>
        {remaining === 0 ? 'לראות את ההישג' : 'מתרגלים כפל בלי הגבלה'}
        <span aria-hidden="true"> ←</span>
      </button>
      <details className="ml-multiplication-mission__details">
        <summary>כל {total} המכפלות שלי</summary>
        <div className="ml-multiplication-mission__facts" aria-label="התקדמות לפי מכפלה">
          {orderedFacts.map((fact) => {
            const done = isMultiplicationFactMastered(progress, fact.id);
            const needed = multiplicationSuccessesNeeded(fact.id);
            const streak = Math.min(needed, progress.facts[fact.id]?.consecutiveDirectCorrect ?? 0);
            return (
              <span
                key={fact.id}
                className={`ml-multiplication-mission__fact${done ? ' is-mastered' : ''}`}
                aria-label={`${fact.a} כפול ${fact.b}: ${done ? 'הושלם' : `${streak} מתוך ${needed}${needed === 5 ? ' ברצף' : ''}`}`}
              >
                <b dir="ltr">{fact.a}×{fact.b}</b>
                <small>{done ? '✓' : `${streak}/${needed}`}</small>
              </span>
            );
          })}
        </div>
      </details>
    </section>
  );
}
