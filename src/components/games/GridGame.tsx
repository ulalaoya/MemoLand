import { useEffect, useRef, useState } from 'react';
import type { Challenge } from '../../types';
import type { GridStimulus } from '../../engines/forest';
import { sfxCorrect, sfxSoft } from '../../audio/sfx';
import { Button } from '../Button';
import type { GameProps } from './common';
import './forest-grid-game.css';

type Phase = 'ready' | 'showing' | 'input' | 'done';

const PHASE_COPY: Record<Phase, { eyebrow: string; title: string; helper: string }> = {
  ready: {
    eyebrow: 'משימת צב היער',
    title: 'שביל הגחליליות',
    helper: 'האורות יידלקו לרגע בין העלים. שמור בזיכרון איפה ראית אותם.',
  },
  showing: {
    eyebrow: 'היער מתעורר',
    title: 'זכור איפה האור נדלק',
    helper: 'הבט היטב בקרחת היער…',
  },
  input: {
    eyebrow: 'עכשיו תורך',
    title: 'מצא את מקומות האור',
    helper: 'הקש על המקומות שבהם הופיעו הגחליליות.',
  },
  done: {
    eyebrow: 'הקרחת נפתחה',
    title: 'היער מגלה את הדרך',
    helper: 'האורות הנכונים מאירים שוב בין העלים.',
  },
};

export function GridGame({
  challenge,
  onResult,
}: GameProps & { challenge: Challenge<GridStimulus, number[]> }) {
  const stim = challenge.stimulus;
  const total = stim.grid * stim.grid;
  const [phase, setPhase] = useState<Phase>('showing');
  const [picked, setPicked] = useState<number[]>([]);
  const pickedRef = useRef<number[]>([]);
  pickedRef.current = picked;
  const [result, setResult] = useState<boolean | null>(null);
  const startRef = useRef(0);
  const submittedRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const copy = PHASE_COPY[phase];

  useEffect(() => {
    timers.current.push(setTimeout(() => {
      setPhase('input');
      startRef.current = performance.now();
    }, stim.viewMs));
    return () => timers.current.forEach(clearTimeout);
  }, [stim.viewMs]);

  function toggle(index: number) {
    setPicked((current) => (
      current.includes(index)
        ? current.filter((cell) => cell !== index)
        : [...current, index]
    ));
  }

  function submit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const given = pickedRef.current;
    const expected = challenge.answer;
    const correct = given.length === expected.length && given.every((cell) => expected.includes(cell));
    correct ? sfxCorrect() : sfxSoft();
    setResult(correct);
    setPhase('done');
    timers.current.push(setTimeout(
      () => onResult({
        correct,
        rtMs: performance.now() - startRef.current,
        span: correct ? expected.length : undefined,
      }),
      1300,
    ));
  }

  return (
    <section className={`ml-forest-game ml-forest-game--${phase}`} data-forest-game data-phase={phase}>
      <ForestCanopy />

      <header className="ml-forest-game__header" aria-live="polite">
        <span className="ml-forest-game__eyebrow">{copy.eyebrow}</span>
        <h2>{copy.title}</h2>
        <p>{copy.helper}</p>
      </header>

      <div className="ml-forest-game__challenge">
          <div className="ml-forest-board" data-forest-grid={stim.grid}>
            <span className="ml-forest-board__vine ml-forest-board__vine--start" aria-hidden>❧</span>
            <span className="ml-forest-board__vine ml-forest-board__vine--end" aria-hidden>❧</span>
            <div
              className="ml-forest-grid"
              style={{ '--ml-forest-grid': stim.grid } as React.CSSProperties}
              role="group"
              aria-label="קרחת אורות היער"
            >
              {Array.from({ length: total }).map((_, index) => {
                const answerCell = stim.cells.includes(index);
                const selected = picked.includes(index);
                const lit = phase === 'showing' && answerCell;
                const revealed = phase === 'done' && answerCell;
                const wrongPick = phase === 'done' && selected && !answerCell;
                const className = [
                  'ml-forest-cell',
                  lit ? 'is-lit' : '',
                  selected ? 'is-selected' : '',
                  revealed ? 'is-answer' : '',
                  wrongPick ? 'is-wrong-pick' : '',
                ].filter(Boolean).join(' ');
                const stateLabel = phase === 'input'
                  ? selected ? 'נבחר' : 'לא נבחר'
                  : lit || revealed ? 'מואר' : 'כבוי';

                return (
                  <button
                    key={index}
                    type="button"
                    className={className}
                    disabled={phase !== 'input'}
                    aria-pressed={phase === 'input' ? selected : undefined}
                    aria-label={`מקום ${index + 1}, ${stateLabel}`}
                    onClick={() => toggle(index)}
                  >
                    <span className="ml-forest-cell__rings" aria-hidden />
                    <span className="ml-forest-cell__firefly" aria-hidden>✦</span>
                    <span className="ml-forest-cell__leaf" aria-hidden>◆</span>
                  </button>
                );
              })}
            </div>
          </div>

          {phase === 'input' ? (
            <div className="ml-forest-game__controls">
              <span className="ml-forest-game__selection" aria-live="polite">
                {picked.length === 0 ? 'עוד לא סימנת מקום' : `סימנת ${picked.length} ${picked.length === 1 ? 'מקום' : 'מקומות'}`}
              </span>
              <Button variant="green" onClick={submit} disabled={picked.length === 0} icon="✓">
                פותחים את השביל
              </Button>
            </div>
          ) : null}

          {phase === 'done' && result !== null ? (
            <div className={`ml-forest-game__result ${result ? 'is-success' : 'is-guided'}`} role="status">
              <span aria-hidden>{result ? '🌟' : '🍃'}</span>
              <strong>{result ? 'מצוין! כל הגחליליות נמצאו' : 'כמעט! האורות מראים את הדרך'}</strong>
            </div>
          ) : null}
      </div>
      <div className="ml-forest-game__world-label" aria-hidden>✦ שביל הגחליליות ✦</div>
    </section>
  );
}

function ForestCanopy() {
  return (
    <div className="ml-forest-game__canopy" aria-hidden>
      <span>●</span><span>●</span><span>●</span><span>●</span><span>●</span>
      <i>✦</i><i>✦</i><i>✦</i>
    </div>
  );
}
