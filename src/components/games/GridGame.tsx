import { useEffect, useRef, useState } from 'react';
import type { Challenge } from '../../types';
import type { GridStimulus } from '../../engines/forest';
import { sfxCorrect, sfxSoft } from '../../audio/sfx';
import { Button } from '../Button';
import { FeedbackBanner } from './common';
import type { GameProps } from './common';

type Phase = 'ready' | 'showing' | 'input' | 'done';

export function GridGame({
  challenge,
  color,
  onResult,
}: GameProps & { challenge: Challenge<GridStimulus, number[]> }) {
  const stim = challenge.stimulus;
  const total = stim.grid * stim.grid;
  const [phase, setPhase] = useState<Phase>('ready');
  const [picked, setPicked] = useState<number[]>([]);
  const pickedRef = useRef<number[]>([]);
  pickedRef.current = picked;
  const [result, setResult] = useState<boolean | null>(null);
  const startRef = useRef(0);
  const submittedRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function run() {
    setPhase('showing');
    timers.current.push(
      setTimeout(() => {
        setPhase('input');
        startRef.current = performance.now();
      }, stim.viewMs),
    );
  }

  function toggle(i: number) {
    setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  }

  function submit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const given = pickedRef.current;
    const exp = challenge.answer;
    const correct = given.length === exp.length && given.every((x) => exp.includes(x));
    correct ? sfxCorrect() : sfxSoft();
    setResult(correct);
    setPhase('done');
    setTimeout(() => onResult({ correct, rtMs: performance.now() - startRef.current, span: correct ? exp.length : undefined }), 1300);
  }

  const cellStyle = (i: number): React.CSSProperties => {
    const lit = phase === 'showing' && stim.cells.includes(i);
    const chosen = picked.includes(i);
    const reveal = phase === 'done' && stim.cells.includes(i);
    return {
      aspectRatio: '1',
      borderRadius: 12,
      border: `3px solid ${chosen || lit || reveal ? '#fff' : 'var(--gray-300)'}`,
      background: lit || reveal ? color : chosen ? 'var(--btn-blue)' : 'var(--gray-100)',
      boxShadow: '0 2px 0 rgba(36,50,71,.15)',
      transition: 'background .15s',
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      {phase === 'ready' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <p style={{ fontSize: 25, fontFamily: 'var(--font-head)', fontWeight: 700, lineHeight: 1.3 }}>{challenge.prompt}</p>
          <p style={{ fontSize: 18, fontWeight: 600 }}>שים לב איפה נדלק האור!</p>
          <Button variant="green" size="lg" onClick={run} icon="▶">אני מוכן</Button>
        </div>
      )}

      {phase !== 'ready' && (
        <>
          {phase === 'input' && <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 20 }}>הקש על המקומות שנדלקו</p>}
          {phase === 'showing' && <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 20 }}>זכור...</p>}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stim.grid}, 1fr)`, gap: 8, width: '100%', maxWidth: 300 }}>
            {Array.from({ length: total }).map((_, i) => (
              <button key={i} disabled={phase !== 'input'} onClick={() => toggle(i)} style={cellStyle(i)} aria-label={`תא ${i + 1}`} />
            ))}
          </div>
          {phase === 'input' && (
            <Button variant="blue" onClick={submit} disabled={picked.length === 0}>אישור</Button>
          )}
          {phase === 'done' && result !== null && <FeedbackBanner correct={result} />}
        </>
      )}
    </div>
  );
}
