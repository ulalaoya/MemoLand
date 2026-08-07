import { useEffect, useRef, useState } from 'react';
import type { Challenge } from '../../types';
import type { MemorizeStimulus } from '../../engines/castle';
import { sfxCorrect, sfxSoft } from '../../audio/sfx';
import { Button } from '../Button';
import { FeedbackBanner } from './common';
import type { GameProps } from './common';

type Phase = 'ready' | 'showing' | 'input' | 'done';

export function MemorizeGame({
  challenge,
  color,
  onResult,
}: GameProps & { challenge: Challenge<MemorizeStimulus, string[]> }) {
  const stim = challenge.stimulus;
  const [phase, setPhase] = useState<Phase>('ready');
  const [assembled, setAssembled] = useState<number[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const startRef = useRef(0);
  const submittedRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (phase === 'input' && assembled.length === stim.items.length) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assembled, phase]);

  function run() {
    setPhase('showing');
    timers.current.push(
      setTimeout(() => {
        setPhase('input');
        startRef.current = performance.now();
      }, stim.viewMs),
    );
  }

  function submit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const given = assembled.map((i) => stim.scrambled[i]);
    const correct = given.length === challenge.answer.length && given.every((w, i) => w === challenge.answer[i]);
    correct ? sfxCorrect() : sfxSoft();
    setResult(correct);
    setPhase('done');
    setTimeout(() => onResult({ correct, rtMs: performance.now() - startRef.current, span: correct ? stim.items.length : undefined }), 1300);
  }

  const tile = (label: string, onClick: (() => void) | undefined, active: boolean, key: React.Key) => (
    <button
      key={key}
      onClick={onClick}
      disabled={!onClick}
      style={{
        fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 18, padding: '10px 14px', borderRadius: 12,
        border: `2px solid ${active ? '#fff' : 'var(--gray-300)'}`, background: active ? color : 'var(--panel)',
        color: active ? '#fff' : 'var(--ink)', boxShadow: '0 3px 0 rgba(36,50,71,.15)', opacity: onClick ? 1 : 0.35,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
      {phase === 'ready' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <p style={{ fontSize: 25, fontFamily: 'var(--font-head)', fontWeight: 700, lineHeight: 1.3 }}>{challenge.prompt}</p>
          <p style={{ fontSize: 18, fontWeight: 600 }}>הרשימה תיעלם — אז שנן טוב!</p>
          <Button variant="green" size="lg" onClick={run} icon="▶">אני מוכן</Button>
        </div>
      )}

      {phase === 'showing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 20 }}>שנן לפי הסדר...</p>
          {stim.items.map((w, i) => (
            <div key={i} className="display" style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 24, color, direction: 'rtl' }}>
              {i + 1}. {w}
            </div>
          ))}
        </div>
      )}

      {phase === 'input' && (
        <>
          <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 20 }}>סדר לפי מה שזכרת:</p>
          <div style={{ minHeight: 46, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {assembled.length === 0 && <span style={{ color: 'var(--gray-300)' }}>בחר לפי הסדר…</span>}
            {assembled.map((idx, pos) => tile(stim.scrambled[idx], () => setAssembled((a) => a.filter((_, p) => p !== pos)), true, `a${pos}`))}
          </div>
          <hr style={{ width: '80%', border: 'none', borderTop: '2px dashed var(--gray-300)' }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {stim.scrambled.map((w, i) => tile(w, assembled.includes(i) ? undefined : () => setAssembled((a) => [...a, i]), false, `s${i}`))}
          </div>
        </>
      )}

      {phase === 'done' && result !== null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          <FeedbackBanner correct={result} />
          {!result && <p style={{ fontFamily: 'var(--font-head)', textAlign: 'center' }}>הסדר היה: <b style={{ color }}>{challenge.answer.join(' · ')}</b></p>}
        </div>
      )}
    </div>
  );
}
