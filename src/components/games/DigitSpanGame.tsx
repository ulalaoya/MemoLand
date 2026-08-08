import { useEffect, useRef, useState } from 'react';
import type { Challenge } from '../../types';
import type { DigitSpanStimulus } from '../../engines/numbers';
import { speak } from '../../audio/speech';
import { sfxCorrect, sfxSoft } from '../../audio/sfx';
import { FeedbackBanner, ReplayButton } from './common';
import type { GameProps } from './common';
import {
  NumbersValleyChallenge,
  ValleyEnteredDigits,
  ValleyFocusBreath,
  ValleyNumberPad,
  ValleyNumberToken,
  ValleyReadyButton,
  type NumbersChallengePhase,
} from './NumbersValleyChallenge';

type Phase = 'ready' | 'showing' | 'input' | 'done';
const FOCUS_BREATH_MS = 480;

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
        }, FOCUS_BREATH_MS + i * stim.flashMs),
      );
    });
    timers.current.push(
      setTimeout(() => {
        setShownIdx(-1);
        setPhase('input');
        startRef.current = performance.now();
      }, FOCUS_BREATH_MS + stim.digits.length * stim.flashMs + 300),
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

  const challengePhase: NumbersChallengePhase =
    phase === 'showing'
      ? 'encoding'
      : phase === 'input'
        ? 'recall'
        : phase === 'done' && result
          ? 'success'
          : phase;

  return (
    <NumbersValleyChallenge phase={challengePhase}>
      {phase === 'ready' && (
        <div className="ml-valley-ready">
          <span className="ml-valley-ready__eyebrow">אתגר הזיכרון</span>
          <p className="ml-valley-ready__prompt">{challenge.prompt}</p>
          <p className="ml-valley-ready__hint">
            תזכור <b className="ltr">{stim.digits.length}</b> ספרות — ותקליד אותן {modeHint}
          </p>
          <ValleyReadyButton onClick={runShow} />
        </div>
      )}

      {phase === 'showing' && (
        shownIdx >= 0
          ? <ValleyNumberToken key={shownIdx}>{stim.digits[shownIdx]}</ValleyNumberToken>
          : <ValleyFocusBreath />
      )}

      {phase === 'input' && (
        <div className="ml-valley-recall">
          <div className="ml-valley-recall__header">
            <span className="ml-valley-recall__eyebrow">עכשיו תורך</span>
            <p className="ml-valley-recall__prompt">הקלד {modeHint}</p>
          </div>
          <ValleyEnteredDigits digits={entered} />
          <ValleyNumberPad
            onDigit={(d) => setEntered((e) => (e.length < stim.digits.length ? [...e, d] : e))}
            onBackspace={() => setEntered((e) => e.slice(0, -1))}
            onSubmit={submit}
            submitDisabled={entered.length === 0}
          />
          <span className="ml-valley-replay"><ReplayButton onReplay={runShow} limit={2} /></span>
        </div>
      )}

      {phase === 'done' && result !== null && (
        <div className="ml-valley-result">
          <FeedbackBanner correct={result} />
          {!result && (
            <p className="ml-valley-result__answer">
              הדרך הייתה:{' '}
              <b className="ltr" style={{ color }}>
                {challenge.answer.join(' ')}
              </b>
            </p>
          )}
        </div>
      )}
    </NumbersValleyChallenge>
  );
}
