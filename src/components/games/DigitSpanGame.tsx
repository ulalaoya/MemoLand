import { useEffect, useRef, useState } from 'react';
import type { Challenge } from '../../types';
import type { DigitSpanStimulus } from '../../engines/numbers';
import { speak } from '../../audio/speech';
import { sfxCorrect, sfxSoft } from '../../audio/sfx';
import { Button } from '../Button';
import { EnteredDigits, FeedbackBanner, NumberPad, ReplayButton } from './common';
import type { GameProps } from './common';

type Phase = 'ready' | 'showing' | 'input' | 'done';

export function DigitSpanGame({
  challenge,
  color,
  speechRate,
  onResult,
}: GameProps & { challenge: Challenge<DigitSpanStimulus, number[]> }) {
  const stim = challenge.stimulus;
  const [phase, setPhase] = useState<Phase>('ready');
  const [shownIdx, setShownIdx] = useState(-1);
  const [entered, setEntered] = useState<number[]>([]);
  const enteredRef = useRef<number[]>([]);
  enteredRef.current = entered;
  const submittedRef = useRef(false);
  const [result, setResult] = useState<boolean | null>(null);
  const startRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }
  useEffect(() => () => clearTimers(), []);

  function runShow() {
    clearTimers();
    setPhase('showing');
    setShownIdx(-1);
    stim.digits.forEach((d, i) => {
      timers.current.push(
        setTimeout(() => {
          setShownIdx(i);
          // queue=true — כל ספרה נאמרת עד הסוף בלי לבטל את הקודמת
          speak(String(d), speechRate, { queue: true });
        }, i * stim.flashMs),
      );
    });
    timers.current.push(
      setTimeout(() => {
        setShownIdx(-1);
        setPhase('input');
        startRef.current = performance.now();
      }, stim.digits.length * stim.flashMs + 300),
    );
  }

  function submit() {
    if (submittedRef.current) return; // הגנה מפני שליחה כפולה
    submittedRef.current = true;
    const rtMs = performance.now() - startRef.current;
    const exp = challenge.answer;
    const given = enteredRef.current;
    const correct = given.length === exp.length && given.every((d, i) => d === exp[i]);
    correct ? sfxCorrect() : sfxSoft(); // צליל מיידי בזמן התשובה
    setResult(correct);
    setPhase('done');
    setTimeout(() => onResult({ correct, rtMs, span: correct ? stim.digits.length : undefined }), 1300);
  }

  // תמיכה במקלדת פיזית (למחשב): ספרות, מחיקה, Enter לאישור
  useEffect(() => {
    if (phase !== 'input') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        setEntered((prev) => (prev.length < stim.digits.length ? [...prev, Number(e.key)] : prev));
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setEntered((prev) => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        if (enteredRef.current.length > 0) submit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, stim.digits.length]);

  const modeHint =
    stim.mode === 'backward' ? 'מהסוף להתחלה' : stim.mode === 'sort' ? 'מהקטן לגדול' : 'לפי הסדר';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      {phase === 'ready' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <p style={{ fontSize: 26, fontFamily: 'var(--font-head)', fontWeight: 700, lineHeight: 1.3 }}>{challenge.prompt}</p>
          <p style={{ color: 'var(--ink)', fontSize: 19, fontWeight: 600 }}>
            תזכור <b className="ltr">{stim.digits.length}</b> ספרות — ותקליד אותן {modeHint}
          </p>
          <Button variant="green" size="lg" onClick={runShow} icon="▶">
            אני מוכן
          </Button>
        </div>
      )}

      {phase === 'showing' && (
        <div style={{ height: 180, display: 'grid', placeItems: 'center' }}>
          <span
            key={shownIdx}
            className="display"
            style={{
              fontSize: 96,
              color,
              animation: 'pop .25s ease',
              textShadow: '0 3px 0 rgba(36,50,71,.25)',
            }}
          >
            {shownIdx >= 0 ? stim.digits[shownIdx] : ''}
          </span>
        </div>
      )}

      {phase === 'input' && (
        <>
          <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 22 }}>הקלד {modeHint}:</p>
          <EnteredDigits digits={entered} />
          <NumberPad
            color={color}
            onDigit={(d) => setEntered((e) => (e.length < stim.digits.length ? [...e, d] : e))}
            onBackspace={() => setEntered((e) => e.slice(0, -1))}
            onSubmit={submit}
            submitDisabled={entered.length === 0}
          />
          <ReplayButton onReplay={runShow} limit={2} />
        </>
      )}

      {phase === 'done' && result !== null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <FeedbackBanner correct={result} />
          {!result && (
            <p style={{ fontFamily: 'var(--font-head)' }}>
              הדרך הייתה:{' '}
              <b className="ltr" style={{ color }}>
                {challenge.answer.join(' ')}
              </b>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
