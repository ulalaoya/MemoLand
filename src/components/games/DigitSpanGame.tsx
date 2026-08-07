import { useEffect, useRef, useState } from 'react';
import type { Challenge } from '../../types';
import type { DigitSpanStimulus } from '../../engines/numbers';
import { speak } from '../../audio/speech';
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
          speak(String(d), speechRate);
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
    const rtMs = performance.now() - startRef.current;
    const exp = challenge.answer;
    const correct = entered.length === exp.length && entered.every((d, i) => d === exp[i]);
    setResult(correct);
    setPhase('done');
    setTimeout(() => onResult({ correct, rtMs, span: correct ? stim.digits.length : undefined }), 1300);
  }

  const modeHint =
    stim.mode === 'backward' ? 'מהסוף להתחלה' : stim.mode === 'sort' ? 'מהקטן לגדול' : 'לפי הסדר';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      {phase === 'ready' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <p style={{ fontSize: 20, fontFamily: 'var(--font-head)', fontWeight: 600 }}>{challenge.prompt}</p>
          <p style={{ color: 'var(--ink)', opacity: 0.7 }}>
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
          <p style={{ fontFamily: 'var(--font-head)', fontWeight: 600 }}>הקלד {modeHint}:</p>
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
