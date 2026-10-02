import { useRef, useState } from 'react';
import type { Challenge } from '../../types';
import type { PatternStimulus, Shape, Token } from '../../engines/patterns';
import { sfxCorrect, sfxSoft } from '../../audio/sfx';
import type { GameProps } from './common';
import { MemoCompanion } from './MemoCompanion';

function ShapeGlyph({ shape, color, size = 46 }: { shape: Shape; color: string; size?: number }) {
  const c = {
    className: 'ml-pattern-rune',
    width: size,
    height: size,
    viewBox: '0 0 52 52',
    style: { '--ml-rune-color': color } as React.CSSProperties,
  } as const;
  const frame = <path className="ml-pattern-rune__crystal" d="M26 2 46 14 48 37 31 50 9 43 3 20 14 7Z" />;
  switch (shape) {
    case 'circle':
      return <svg {...c}>{frame}<circle className="ml-pattern-rune__symbol" cx="26" cy="26" r="12" /></svg>;
    case 'square':
      return <svg {...c}>{frame}<rect className="ml-pattern-rune__symbol" x="15" y="15" width="22" height="22" rx="3" transform="rotate(8 26 26)" /></svg>;
    case 'triangle':
      return <svg {...c}>{frame}<path className="ml-pattern-rune__symbol" d="M26 12 40 38H12Z" /></svg>;
    case 'star':
      return <svg {...c}>{frame}<path className="ml-pattern-rune__symbol" d="m26 10 4.8 10 11 .9-8.4 7.2 2.7 10.7-10.1-5.7-10.1 5.7 2.7-10.7-8.4-7.2 11-.9Z" /></svg>;
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

  const box = (children: React.ReactNode, key: React.Key, isQuestion = false) => (
    <div key={key} className={`ml-pattern-token${isQuestion ? ' is-question' : ''}`}>
      {children}
    </div>
  );

  return (
    <div data-pattern-game>
      <MemoCompanion behavior={chosen === null ? 'thinking' : chosen === challenge.answer ? 'success' : 'idle'} className="ml-pattern-memo" />
      <header className="ml-pattern-prompt">
        <span aria-hidden>✦</span>
        <p>{challenge.prompt}</p>
        <small>פענחו את רצף אבני־הקסם</small>
      </header>

      <div className="ml-pattern-sequence" aria-label="רצף אבני הקסם">
        {stim.sequence.map((t: Token, i) => box(<ShapeGlyph shape={t.shape} color={t.color} />, `s${i}`))}
        {box(<span className="ml-pattern-token__question" style={{ color }}>?</span>, 'q', true)}
      </div>

      <div className="ml-pattern-options" aria-label="אפשרויות להשלמת התבנית">
        {stim.options.map((t: Token, i) => {
          const isChosen = chosen === i;
          const isAnswer = i === challenge.answer;
          return (
            <button
              type="button"
              className={`ml-pattern-option${isChosen ? ' is-chosen' : ''}${chosen !== null && isAnswer ? ' is-answer' : ''}`}
              key={i}
              onClick={() => pick(i)}
              disabled={chosen !== null}
            >
              <ShapeGlyph shape={t.shape} color={t.color} size={44} />
            </button>
          );
        })}
      </div>

      {chosen !== null && (
        <div className={`ml-pattern-result ${chosen === challenge.answer ? 'is-correct' : 'is-retry'}`} aria-live="polite">
          {chosen === challenge.answer ? 'השער נדלק — פתרת את התבנית!' : 'ההרים משנים צורה… נסו שוב'}
        </div>
      )}
    </div>
  );
}
