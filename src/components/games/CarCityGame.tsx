import { useEffect, useRef, useState } from 'react';
import type { Challenge } from '../../types';
import type { CarPlateStimulus } from '../../engines/cars';
import { sfxCorrect, sfxSoft } from '../../audio/sfx';
import type { GameProps } from './common';
import './car-city.css';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

export function CarCityGame({
  challenge,
  onResult,
}: GameProps & { challenge: Challenge<CarPlateStimulus, string> }) {
  const [phase, setPhase] = useState<'show' | 'answer' | 'result'>('show');
  const [entered, setEntered] = useState('');
  const [correct, setCorrect] = useState<boolean | null>(null);
  const startedAt = useRef(performance.now());

  useEffect(() => {
    const timer = window.setTimeout(() => setPhase('answer'), challenge.stimulus.exposureMs);
    return () => window.clearTimeout(timer);
  }, [challenge.stimulus.exposureMs]);

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

  const visiblePlate = phase === 'show' || phase === 'result'
    ? challenge.stimulus.plate
    : '•'.repeat(challenge.stimulus.plate.length);

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
          <span className="ml-car-city__plate ml-number-text">{visiblePlate}</span>
          <span className="ml-car-city__wheel ml-car-city__wheel--left" />
          <span className="ml-car-city__wheel ml-car-city__wheel--right" />
        </div>

        {phase !== 'show' ? (
          <div className="ml-car-city__console">
            <div className="ml-car-city__entered ml-number-text" aria-live="polite">
              {entered || <span>{'—'.repeat(challenge.stimulus.plate.length)}</span>}
            </div>
            {phase === 'answer' ? (
              <div className="ml-car-city__keypad">
                {KEYS.map((digit) => <button key={digit} type="button" onClick={() => addDigit(digit)}>{digit}</button>)}
                <button type="button" className="is-erase" aria-label="מחיקת ספרה" onClick={() => setEntered((value) => value.slice(0, -1))}>⌫</button>
                <button type="button" onClick={() => addDigit('0')}>0</button>
                <button type="button" className="is-submit" aria-label="בדיקת התשובה" disabled={entered.length !== challenge.stimulus.plate.length} onClick={submit}>✓</button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="ml-car-city__watch">עוד רגע הלוחית נעלמת…</div>
        )}
      </div>
    </div>
  );
}
