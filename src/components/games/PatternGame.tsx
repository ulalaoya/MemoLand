import { useRef, useState } from 'react';
import type { Challenge } from '../../types';
import type { PatternStimulus, Shape, Token } from '../../engines/patterns';
import { sfxCorrect, sfxSoft } from '../../audio/sfx';
import { FeedbackBanner } from './common';
import type { GameProps } from './common';

const INK = 'var(--ink)';

function ShapeGlyph({ shape, color, size = 46 }: { shape: Shape; color: string; size?: number }) {
  const c = { width: size, height: size, viewBox: '0 0 46 46' } as const;
  switch (shape) {
    case 'circle':
      return <svg {...c}><circle cx="23" cy="23" r="17" fill={color} stroke={INK} strokeWidth="3" /></svg>;
    case 'square':
      return <svg {...c}><rect x="7" y="7" width="32" height="32" rx="5" fill={color} stroke={INK} strokeWidth="3" /></svg>;
    case 'triangle':
      return <svg {...c}><path d="M23 6 L40 38 L6 38 Z" fill={color} stroke={INK} strokeWidth="3" strokeLinejoin="round" /></svg>;
    case 'star':
      return <svg {...c}><path d="M23 5l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" fill={color} stroke={INK} strokeWidth="3" strokeLinejoin="round" /></svg>;
  }
}

export function PatternGame({
  challenge,
  color,
  onResult,
}: GameProps & { challenge: Challenge<PatternStimulus, number> }) {
  const stim = challenge.stimulus;
  const [chosen, setChosen] = useState<number | null>(null);
  const startRef = useRef(performance.now());

  function pick(i: number) {
    if (chosen !== null) return;
    const correct = i === challenge.answer;
    correct ? sfxCorrect() : sfxSoft();
    setChosen(i);
    setTimeout(() => onResult({ correct, rtMs: performance.now() - startRef.current }), 1300);
  }

  const box = (children: React.ReactNode, key: React.Key, extra?: React.CSSProperties) => (
    <div key={key} style={{ width: 56, height: 56, display: 'grid', placeItems: 'center', background: 'var(--panel)', border: '2px solid var(--gray-300)', borderRadius: 12, ...extra }}>
      {children}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
      <p style={{ fontSize: 25, fontFamily: 'var(--font-head)', fontWeight: 700 }}>{challenge.prompt}</p>

      {/* הרצף */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        {stim.sequence.map((t: Token, i) => box(<ShapeGlyph shape={t.shape} color={t.color} />, `s${i}`))}
        {box(<span style={{ fontFamily: 'var(--font-display)', fontSize: 30, color }}>?</span>, 'q', { borderColor: color, borderWidth: 3, background: 'var(--gray-100)' })}
      </div>

      {/* אפשרויות */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {stim.options.map((t: Token, i) => {
          const isChosen = chosen === i;
          const isAnswer = i === challenge.answer;
          const bg = chosen !== null ? (isAnswer ? 'var(--btn-green)' : isChosen ? color : 'var(--panel)') : 'var(--panel)';
          return (
            <button key={i} onClick={() => pick(i)} style={{ width: 68, height: 68, display: 'grid', placeItems: 'center', background: bg, border: '3px solid var(--gray-300)', borderRadius: 16, boxShadow: '0 3px 0 rgba(36,50,71,.15)' }}>
              <ShapeGlyph shape={t.shape} color={t.color} size={44} />
            </button>
          );
        })}
      </div>

      {chosen !== null && <FeedbackBanner correct={chosen === challenge.answer} />}
    </div>
  );
}
