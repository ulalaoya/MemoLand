import { useEffect, useRef, useState } from 'react';
import type { Challenge } from '../../types';
import type { ChainMathStimulus } from '../../engines/numbers';
import { speak } from '../../audio/speech';
import { sfxCorrect, sfxSoft } from '../../audio/sfx';
import { FeedbackBanner } from './common';
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
  const enteredRef = useRef<number[]>([]);
  enteredRef.current = entered;
  const submittedRef = useRef(false);
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
    setStep(-3); // רגע מיקוד חזותי קצר לפני הופעת המספר הראשון
    const seq = [-1, ...stim.steps.map((_, i) => i)];
    seq.forEach((s, i) => {
      timers.current.push(
        setTimeout(() => {
          setStep(s);
          if (s === -1) speak(String(stim.start), speechRate, { queue: true });
          else {
            const st = stim.steps[s];
            const word = st.op === '+' ? 'ועוד' : st.op === '-' ? 'פחות' : 'כפול';
            speak(`${word} ${st.value}`, speechRate, { queue: true });
          }
        }, FOCUS_BREATH_MS + i * stim.revealMs),
      );
    });
    timers.current.push(
      setTimeout(() => {
        setStep(-2); // הסתרה
        setPhase('input');
        startRef.current = performance.now();
      }, FOCUS_BREATH_MS + seq.length * stim.revealMs),
    );
  }

  function submit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const rtMs = performance.now() - startRef.current;
    const val = Number(enteredRef.current.join(''));
    const correct = val === challenge.answer;
    correct ? sfxCorrect() : sfxSoft();
    setResult(correct);
    setPhase('done');
    setTimeout(() => onResult({ correct, rtMs }), 1300);
  }

  // מקלדת פיזית (מחשב)
  useEffect(() => {
    if (phase !== 'input') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') setEntered((p) => (p.length < 5 ? [...p, Number(e.key)] : p));
      else if (e.key === 'Backspace') { e.preventDefault(); setEntered((p) => p.slice(0, -1)); }
      else if (e.key === 'Enter') { if (enteredRef.current.length > 0) submit(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const currentText =
    step === -1
      ? String(stim.start)
      : step >= 0
        ? `${stim.steps[step].op === '×' ? '×' : stim.steps[step].op} ${stim.steps[step].value}`
        : '';

  const challengePhase: NumbersChallengePhase =
    phase === 'showing'
      ? (step === -3 ? 'focus' : 'encoding')
      : phase === 'input'
        ? 'recall'
        : phase === 'done' && result
          ? 'success'
          : phase;

  return (
    <NumbersValleyChallenge phase={challengePhase} memoBeat={step}>
      {phase === 'ready' && (
        <div className="ml-valley-ready">
          <span className="ml-valley-ready__eyebrow">אתגר הדרך</span>
          <p className="ml-valley-ready__prompt">{challenge.prompt}</p>
          <p className="ml-valley-ready__hint">אסור לרשום — רק לזכור בראש!</p>
          <ValleyReadyButton onClick={run} />
        </div>
      )}

      {phase === 'showing' && (
        currentText
          ? <ValleyNumberToken key={step}>{currentText}</ValleyNumberToken>
          : <ValleyFocusBreath />
      )}

      {phase === 'input' && (
        <div className="ml-valley-recall">
          <div className="ml-valley-recall__header">
            <span className="ml-valley-recall__eyebrow">עכשיו תורך</span>
            <p className="ml-valley-recall__prompt">כמה יצא בסוף?</p>
          </div>
          <ValleyEnteredDigits digits={entered} />
          <ValleyNumberPad
            onDigit={(d) => setEntered((e) => (e.length < 5 ? [...e, d] : e))}
            onBackspace={() => setEntered((e) => e.slice(0, -1))}
            onSubmit={submit}
            submitDisabled={entered.length === 0}
          />
        </div>
      )}

      {phase === 'done' && result !== null && (
        <div className="ml-valley-result">
          <FeedbackBanner correct={result} />
          {!result && (
            <p className="ml-valley-result__answer">
              התשובה הייתה:{' '}
              <b className="ltr" style={{ color }}>
                {challenge.answer}
              </b>
            </p>
          )}
        </div>
      )}
    </NumbersValleyChallenge>
  );
}
