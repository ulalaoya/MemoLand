import { useEffect, useRef, useState } from 'react';
import type { Challenge } from '../../types';
import type { MemorizeStimulus } from '../../engines/castle';
import { sfxCorrect, sfxSoft } from '../../audio/sfx';
import { FeedbackBanner } from './common';
import type { GameProps } from './common';
import { MemoCompanion } from './MemoCompanion';
import './treasure-castle.css';

type Phase = 'ready' | 'showing' | 'input' | 'done';

const ITEM_GLYPHS: Record<string, string> = {
  'תפוח': '🍎', 'כלב': '🐕', 'כיסא': '🪑', 'ירח': '🌙', 'ספר': '📘',
  'פרח': '🌸', 'כדור': '⚽', 'עוגה': '🍰', 'דג': '🐟', 'כובע': '🎩',
  'עץ': '🌳', 'מפתח': '🗝️', 'כוכב': '⭐', 'גשר': '🌉', 'ענן': '☁️',
  'תוף': '🥁', 'נעל': '👟', 'מטרייה': '☂️', 'בלון': '🎈', 'פנס': '🔦',
};

export function MemorizeGame({
  challenge,
  onResult,
}: GameProps & { challenge: Challenge<MemorizeStimulus, string[]> }) {
  const stim = challenge.stimulus;
  const [phase, setPhase] = useState<Phase>('showing');
  const [assembled, setAssembled] = useState<number[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const startRef = useRef(0);
  const submittedRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    if (phase !== 'showing') return undefined;
    const previewTimer = setTimeout(() => {
      setPhase('input');
      startRef.current = performance.now();
    }, stim.viewMs);
    return () => clearTimeout(previewTimer);
  }, [phase, stim.viewMs]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (phase === 'input' && assembled.length === stim.items.length) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assembled, phase]);

  function submit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const given = assembled.map((index) => stim.scrambled[index]);
    const correct = given.length === challenge.answer.length && given.every((word, index) => word === challenge.answer[index]);
    correct ? sfxCorrect() : sfxSoft();
    setResult(correct);
    setPhase('done');
    timers.current.push(setTimeout(
      () => onResult({
        correct,
        rtMs: performance.now() - startRef.current,
        span: correct ? stim.items.length : undefined,
      }),
      1350,
    ));
  }

  function replayTreasures() {
    if (phase !== 'input') return;
    setAssembled([]);
    setPhase('showing');
  }

  function tile(label: string, onClick: (() => void) | undefined, selected: boolean, key: React.Key) {
    return (
      <button
        key={key}
        type="button"
        className={`ml-castle-treasure${selected ? ' is-selected' : ''}`}
        onClick={onClick}
        disabled={!onClick}
      >
        <span className="ml-castle-treasure__glyph" aria-hidden>{ITEM_GLYPHS[label] ?? '💎'}</span>
        <span>{label}</span>
      </button>
    );
  }

  return (
    <div data-treasure-castle-game>
      <MemoCompanion behavior={result === true ? 'success' : phase === 'input' ? 'thinking' : 'idle'} className="ml-castle-memo" />
      {phase === 'showing' && (
        <div className="ml-castle-card ml-castle-card--showing" data-castle-treasure-preview>
          <span className="ml-castle-card__eyebrow">חדר האוצר</span>
          <h2 className="ml-castle-card__heading">זכור את האוצרות לפי הסדר</h2>
          <div className="ml-castle-preview-row">
            {stim.items.map((word, index) => (
              <div
                key={`${word}-${index}`}
                className="ml-castle-preview-treasure"
              >
                <span aria-hidden>{ITEM_GLYPHS[word] ?? '💎'}</span>
                <span>{index + 1}. {word}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'input' && (
        <div className="ml-castle-card ml-castle-card--input">
          <span className="ml-castle-card__eyebrow">מנגנון התיבה</span>
          <h2 className="ml-castle-card__heading">סדר את האוצרות כדי לפתוח את התיבה</h2>
          <div className="ml-castle-order-well">
            {assembled.length === 0 && <span className="ml-castle-order-well__placeholder">בחר את האוצר הראשון…</span>}
            {assembled.map((index, position) => tile(
              stim.scrambled[index],
              () => setAssembled((items) => items.filter((_, itemPosition) => itemPosition !== position)),
              true,
              `chosen-${position}`,
            ))}
          </div>
          <div className="ml-castle-divider" aria-hidden />
          <div className="ml-castle-treasure-bank">
            {stim.scrambled.map((word, index) => tile(
              word,
              assembled.includes(index) ? undefined : () => setAssembled((items) => [...items, index]),
              false,
              `treasure-${index}`,
            ))}
          </div>
          <button type="button" className="ml-castle-replay ml-pressable" onClick={replayTreasures}>
            <span aria-hidden>↻</span>
            הצג שוב את האוצרות
          </button>
        </div>
      )}

      {phase === 'done' && result !== null && (
        <div className="ml-castle-card ml-castle-card--done">
          {result ? (
            <>
              <CastleChest open />
              <p className="ml-castle-card__heading">
                התיבה נפתחה! האוצר שלך בדרך
              </p>
            </>
          ) : (
            <>
              <FeedbackBanner correct={false} hint="התיבה כמעט נפתחה — ננסה סדר חדש" />
              <p className="ml-castle-card__answer">
                הסדר היה: <b>{challenge.answer.join(' · ')}</b>
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function CastleChest({ open }: { open: boolean }) {
  return (
    <div className={`ml-castle-chest-stage${open ? ' is-open' : ''}`}>
      <span className="ml-castle-chest-stage__rays" aria-hidden />
      <span className="ml-castle-chest-stage__spark ml-castle-chest-stage__spark--one" aria-hidden>✦</span>
      <span className="ml-castle-chest-stage__spark ml-castle-chest-stage__spark--two" aria-hidden>✦</span>
      <span className="ml-castle-chest-stage__spark ml-castle-chest-stage__spark--three" aria-hidden>✦</span>
      <svg className={`ml-castle-chest${open ? ' is-open' : ''}`} width="132" height="112" viewBox="0 0 132 112" role="img" aria-label={open ? 'תיבת אוצר פתוחה' : 'תיבת אוצר סגורה'}>
        {open ? <path d="M29 42L20 15M66 36V7M101 42l12-25" stroke="#d6a51d" strokeWidth="5" strokeLinecap="round" /> : null}
        <rect x="24" y="59" width="84" height="43" rx="8" fill="#8a4f2a" stroke="#243247" strokeWidth="4" />
        <rect x="24" y="68" width="84" height="11" fill="#d6a51d" stroke="#243247" strokeWidth="3" />
        <path
          d={open ? 'M21 58Q66 16 111 58L108 42Q66 4 24 42Z' : 'M20 58Q66 38 112 58L110 50Q66 30 22 50Z'}
          fill="#6d3c24"
          stroke="#243247"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <rect x="59" y="72" width="14" height="18" rx="4" fill="#fff4c7" stroke="#243247" strokeWidth="3" />
        {open ? ['💎', '⭐', '🪙'].map((item, index) => (
          <text key={item} x={42 + index * 24} y={59 - (index % 2) * 8} fontSize="19">{item}</text>
        )) : null}
      </svg>
      <span className="ml-castle-chest-stage__pedestal" aria-hidden />
    </div>
  );
}
