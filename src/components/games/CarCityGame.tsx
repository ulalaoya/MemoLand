import { useEffect, useRef, useState } from 'react';
import type { Challenge } from '../../types';
import { formatCarPlate, type CarPlateStimulus } from '../../engines/cars';
import { sfxCorrect, sfxSoft } from '../../audio/sfx';
import type { GameProps } from './common';
import { CalculatorKeypad } from './CalculatorKeypad';
import './car-city.css';

export function CarCityGame({
  challenge,
  onResult,
}: GameProps & { challenge: Challenge<CarPlateStimulus, string> }) {
  const [phase, setPhase] = useState<'show' | 'answer' | 'result'>('show');
  const [entered, setEntered] = useState('');
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [replaysLeft, setReplaysLeft] = useState(1);
  const startedAt = useRef(performance.now());

  useEffect(() => {
    if (phase !== 'show') return;
    const timer = window.setTimeout(() => setPhase('answer'), challenge.stimulus.exposureMs);
    return () => window.clearTimeout(timer);
  }, [challenge.stimulus.exposureMs, phase]);

  function replayPlate() {
    if (phase !== 'answer' || replaysLeft <= 0) return;
    setEntered('');
    setReplaysLeft((left) => left - 1);
    setPhase('show');
  }

  function addDigit(digit: string) {
    if (phase !== 'answer' || entered.length >= challenge.stimulus.plate.length) return;
    setEntered((value) => value + digit);
  }

  function submit() {
    if (phase !== 'answer' || entered.length !== challenge.stimulus.plate.length) return;
    const isCorrect = entered === challenge.answer;
    setCorrect(isCorrect);
    setPhase('result');
    isCorrect ? sfxCorrect() : sfxSoft();
    window.setTimeout(() => onResult({ correct: isCorrect, rtMs: performance.now() - startedAt.current, span: challenge.stimulus.plate.length }), 720);
  }

  const plateLength = challenge.stimulus.plate.length;
  const visiblePlate = phase === 'show' || phase === 'result'
    ? formatCarPlate(challenge.stimulus.plate)
    : formatCarPlate('•'.repeat(plateLength));
  const enteredPlate = entered
    ? formatCarPlate(entered, plateLength)
    : formatCarPlate('—'.repeat(plateLength));

  return (
    <div className={`ml-car-city ml-car-city--${phase}${correct === true ? ' is-correct' : correct === false ? ' is-wrong' : ''}`}>
      <div className="ml-car-city__scene" aria-hidden />
      <div className="ml-car-city__content">
        <div className="ml-car-city__story">
          <span>עיר המכוניות</span>
          <strong>{phase === 'show' ? 'זכור את לוחית הרישוי' : phase === 'answer' ? 'מה היה המספר?' : correct ? 'זכרת מצוין!' : 'כמעט! ננסה לוחית חדשה'}</strong>
        </div>

        <div className="ml-car-city__car" aria-label={`לוחית רישוי ${phase === 'show' || phase === 'result' ? visiblePlate : 'מוסתרת'}`}>
          <span className="ml-car-city__window" />
          <span className="ml-car-city__light ml-car-city__light--left" />
          <span className="ml-car-city__light ml-car-city__light--right" />
          <span className="ml-car-city__plate ml-number-text" data-length={plateLength}>{visiblePlate}</span>
          <span className="ml-car-city__wheel ml-car-city__wheel--left" />
          <span className="ml-car-city__wheel ml-car-city__wheel--right" />
        </div>

        {phase !== 'show' ? (
          <div className="ml-car-city__console">
            <div className="ml-car-city__entered ml-number-text" data-length={plateLength} aria-live="polite">
              {entered ? enteredPlate : <span>{enteredPlate}</span>}
            </div>
            {phase === 'answer' ? (
              <>
                <button type="button" className="ml-car-city__replay ml-pressable" onClick={replayPlate} disabled={replaysLeft <= 0}>
                  👁️ הצג שוב {replaysLeft > 0 ? `(${replaysLeft})` : ''}
                </button>
                <CalculatorKeypad
                  theme="cars"
                  className="ml-car-city__keypad"
                  onDigit={(digit) => addDigit(String(digit))}
                  onBackspace={() => setEntered((value) => value.slice(0, -1))}
                  onSubmit={submit}
                  backspaceDisabled={entered.length === 0}
                  submitDisabled={entered.length !== challenge.stimulus.plate.length}
                />
              </>
            ) : null}
          </div>
        ) : (
          <div className="ml-car-city__watch">עוד רגע הלוחית נעלמת…</div>
        )}
      </div>
    </div>
  );
}
