import { useRef, useState } from 'react';
import type { Challenge } from '../../types';
import type { SpeedStimulus } from '../../engines/speed';
import { sfxCorrect, sfxSoft } from '../../audio/sfx';
import { FeedbackBanner } from './common';
import type { GameProps } from './common';
import { TapGlyph } from '../svg/TapIcon';

export function QuickMatchGame({
  challenge,
  color,
  onResult,
}: GameProps & { challenge: Challenge<SpeedStimulus, number> }) {
  const stim = challenge.stimulus;
  const [chosen, setChosen] = useState<number | null>(null);
  const startRef = useRef(performance.now());

  function pick(i: number) {
    if (chosen !== null) return;
    const correct = i === challenge.answer;
    correct ? sfxCorrect() : sfxSoft();
    setChosen(i);
    setTimeout(() => onResult({ correct, rtMs: performance.now() - startRef.current }), 900);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'center' }}>
      <p style={{ fontSize: 25, fontFamily: 'var(--font-head)', fontWeight: 700 }}>{challenge.prompt}</p>

      <div style={{ padding: 14, borderRadius: 18, background: 'var(--panel)', border: `3px solid ${color}` }}>
        <TapGlyph id={stim.target} size={72} />
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {stim.options.map((id, i) => {
          const isChosen = chosen === i;
          const isAnswer = i === challenge.answer;
          const bg = chosen !== null ? (isAnswer ? 'var(--btn-green)' : isChosen ? color : 'var(--panel)') : 'var(--panel)';
          return (
            <button key={i} onClick={() => pick(i)} style={{ padding: 12, background: bg, border: '3px solid var(--gray-300)', borderRadius: 16, boxShadow: '0 3px 0 rgba(36,50,71,.15)' }}>
              <TapGlyph id={id} size={52} />
            </button>
          );
        })}
      </div>

      {chosen !== null && <FeedbackBanner correct={chosen === challenge.answer} />}
    </div>
  );
}
