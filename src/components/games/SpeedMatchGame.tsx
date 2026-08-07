/* אתגר מהירות — התאמת סמלים מהירה ב-60 שניות. מסגור חיובי בלבד.
   עצמאי (לא תלוי במנועי הארצות) כדי לעבוד גם לפני שארץ 5 נבנתה. */
import { useEffect, useRef, useState } from 'react';
import { TAP_ICONS } from '../../engines/echoesContent';
import { TapGlyph } from '../svg/TapIcon';
import { sfxCoin } from '../../audio/sfx';

export function SpeedMatchGame({
  seconds = 60,
  color,
  onDone,
}: {
  seconds?: number;
  color: string;
  onDone: (score: number) => void;
}) {
  const [left, setLeft] = useState(seconds);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [flash, setFlash] = useState<'good' | 'soft' | null>(null);
  const target = useRef(TAP_ICONS[0].id);
  const options = useRef<string[]>([]);
  const doneRef = useRef(false);

  function newRound() {
    const shuffled = [...TAP_ICONS].sort(() => Math.random() - 0.5);
    target.current = shuffled[0].id;
    const opts = [shuffled[0].id, shuffled[1].id, shuffled[2].id].sort(() => Math.random() - 0.5);
    options.current = opts;
    setRound((r) => r + 1);
  }

  useEffect(() => {
    newRound();
    const t = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          clearInterval(t);
          if (!doneRef.current) {
            doneRef.current = true;
            setTimeout(() => onDone(score), 50);
          }
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // שומר score מעודכן ל-onDone
  const scoreRef = useRef(0);
  scoreRef.current = score;
  useEffect(() => {
    return () => {
      if (!doneRef.current) onDone(scoreRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pick(id: string) {
    if (left <= 0) return;
    if (id === target.current) {
      setScore((s) => s + 1);
      setFlash('good');
      sfxCoin();
    } else {
      setFlash('soft');
    }
    setTimeout(() => setFlash(null), 150);
    newRound();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700 }}>
          כמה תספיק? <span className="ltr" style={{ color }}>{score}</span>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            color: left <= 10 ? 'var(--btn-orange)' : 'var(--ink)',
            direction: 'ltr',
          }}
        >
          ⏱ {left}
        </div>
      </div>

      <div style={{ opacity: 0.7 }}>מצא את הסמל הזהה:</div>
      <div
        key={`t${round}`}
        style={{
          padding: 16,
          borderRadius: 18,
          background: 'var(--panel)',
          border: `3px solid ${color}`,
          animation: 'pop .2s ease',
        }}
      >
        <TapGlyph id={target.current} size={72} />
      </div>

      <div style={{ display: 'flex', gap: 14 }}>
        {options.current.map((id, i) => (
          <button
            key={`${round}-${i}`}
            onClick={() => pick(id)}
            style={{
              padding: 12,
              borderRadius: 16,
              background: 'var(--panel)',
              border: '3px solid var(--gray-300)',
              boxShadow: '0 3px 0 rgba(36,50,71,.15)',
            }}
          >
            <TapGlyph id={id} size={52} />
          </button>
        ))}
      </div>

      {flash === 'good' && <div style={{ color: 'var(--btn-green)', fontWeight: 700 }}>יופי! +1</div>}
      {flash === 'soft' && <div style={{ color: 'var(--ink)', opacity: 0.6, fontWeight: 700 }}>נסה עוד!</div>}
    </div>
  );
}
