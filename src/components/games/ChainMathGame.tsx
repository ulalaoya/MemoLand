import { useEffect, useRef, useState } from 'react';
import type { Challenge } from '../../types';
import type { ChainMathStimulus } from '../../engines/numbers';
import { speak } from '../../audio/speech';
import { Button } from '../Button';
import { EnteredDigits, FeedbackBanner, NumberPad } from './common';
import type { GameProps } from './common';

type Phase = 'ready' | 'showing' | 'input' | 'done';

export function ChainMathGame({
  challenge,
  color,
  speechRate,
  onResult,
}: GameProps & { challenge: Challenge<ChainMathStimulus, number> }) {
  const stim = challenge.stimulus;
  const [phase, setPhase] = useState<Phase>('ready');
  const [step, setStep] = useState(-1); // -1 = מספר התחלה, 0.. = שלבים
  const [entered, setEntered] = useState<number[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const startRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  function run() {
    clearTimers();
    setPhase('showing');
    const seq = [-1, ...stim.steps.map((_, i) => i)];
    seq.forEach((s, i) => {
      timers.current.push(
        setTimeout(() => {
          setStep(s);
          if (s === -1) speak(String(stim.start), speechRate);
          else {
            const st = stim.steps[s];
            const word = st.op === '+' ? 'ועוד' : st.op === '-' ? 'פחות' : 'כפול';
            speak(`${word} ${st.value}`, speechRate);
          }
        }, i * stim.revealMs),
      );
    });
    timers.current.push(
      setTimeout(() => {
        setStep(-2); // הסתרה
        setPhase('input');
        startRef.current = performance.now();
      }, seq.length * stim.revealMs),
    );
  }

  function submit() {
    const rtMs = performance.now() - startRef.current;
    const val = Number(entered.join(''));
    const correct = val === challenge.answer;
    setResult(correct);
    setPhase('done');
    setTimeout(() => onResult({ correct, rtMs }), 1300);
  }

  const currentText =
    step === -1
      ? String(stim.start)
      : step >= 0
        ? `${stim.steps[step].op === '×' ? '×' : stim.steps[step].op} ${stim.steps[step].value}`
        : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      {phase === 'ready' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <p style={{ fontSize: 20, fontFamily: 'var(--font-head)', fontWeight: 600 }}>{challenge.prompt}</p>
          <p style={{ opacity: 0.7 }}>אסור לרשום — רק לזכור בראש!</p>
          <Button variant="green" size="lg" onClick={run} icon="▶">
            אני מוכן
          </Button>
        </div>
      )}

      {phase === 'showing' && (
        <div style={{ height: 180, display: 'grid', placeItems: 'center' }}>
          <span key={step} className="display" style={{ fontSize: 72, color, animation: 'pop .25s ease' }}>
            {currentText}
          </span>
        </div>
      )}

      {phase === 'input' && (
        <>
          <p style={{ fontFamily: 'var(--font-head)', fontWeight: 600 }}>כמה יצא בסוף?</p>
          <EnteredDigits digits={entered} />
          <NumberPad
            color={color}
            onDigit={(d) => setEntered((e) => (e.length < 5 ? [...e, d] : e))}
            onBackspace={() => setEntered((e) => e.slice(0, -1))}
            onSubmit={submit}
            submitDisabled={entered.length === 0}
          />
        </>
      )}

      {phase === 'done' && result !== null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <FeedbackBanner correct={result} />
          {!result && (
            <p style={{ fontFamily: 'var(--font-head)' }}>
              התשובה הייתה:{' '}
              <b className="ltr" style={{ color }}>
                {challenge.answer}
              </b>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
