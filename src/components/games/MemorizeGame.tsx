import { useEffect, useRef, useState } from 'react';
import type { Challenge } from '../../types';
import type { MemorizeStimulus } from '../../engines/castle';
import { sfxCorrect, sfxSoft } from '../../audio/sfx';
import { Button } from '../Button';
import { FeedbackBanner } from './common';
import type { GameProps } from './common';

type Phase = 'ready' | 'showing' | 'input' | 'done';

const ITEM_GLYPHS: Record<string, string> = {
  'תפוח': '🍎', 'כלב': '🐕', 'שולחן': '🪑', 'ירח': '🌙', 'ספר': '📘',
  'פרח': '🌸', 'כדור': '⚽', 'עוגה': '🍰', 'דג': '🐟', 'כובע': '🎩',
  'עץ': '🌳', 'מפתח': '🗝️', 'כוכב': '⭐', 'גשר': '🌉', 'ענן': '☁️',
  'תוף': '🥁', 'נעל': '👟', 'מטרייה': '☂️', 'בלון': '🎈', 'פנס': '🔦',
};

export function MemorizeGame({
  challenge,
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

  function tile(label: string, onClick: (() => void) | undefined, selected: boolean, key: React.Key) {
    return (
      <button
        key={key}
        type="button"
        onClick={onClick}
        disabled={!onClick}
        style={{
          minWidth: 82,
          padding: '9px 12px',
          borderRadius: 14,
          border: `3px solid ${selected ? '#ffffff' : '#d6a51d'}`,
          background: selected ? '#243247' : '#ffffff',
          color: selected ? '#ffffff' : '#243247',
          boxShadow: '0 3px 0 rgba(36,50,71,.18)',
          opacity: onClick ? 1 : 0.36,
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: 17,
        }}
      >
        <span aria-hidden style={{ marginInlineEnd: 6 }}>{ITEM_GLYPHS[label] ?? '💎'}</span>
        {label}
      </button>
    );
  }

  return (
    <div data-treasure-castle-game style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', color: '#243247' }}>
      {phase === 'ready' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 15, alignItems: 'center' }}>
          <CastleChest open={false} />
          <p style={{ margin: 0, fontSize: 26, fontFamily: 'var(--font-head)', fontWeight: 800, lineHeight: 1.25 }}>
            זכור את האוצרות לפי הסדר
          </p>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>האוצרות יופיעו לזמן קצר ואז ייכנסו לתיבה.</p>
          <Button variant="green" size="lg" onClick={run} icon="▶">פותחים את שער הטירה</Button>
        </div>
      )}

      {phase === 'showing' && (
        <div data-castle-treasure-preview style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 21 }}>זכור את האוצרות לפי הסדר</p>
          <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', justifyContent: 'center' }}>
            {stim.items.map((word, index) => (
              <div
                key={`${word}-${index}`}
                style={{
                  width: 92,
                  minHeight: 82,
                  display: 'grid',
                  placeItems: 'center',
                  padding: 8,
                  borderRadius: 16,
                  background: '#fffdf7',
                  border: '3px solid #d6a51d',
                  boxShadow: '0 4px 0 rgba(36,50,71,.16)',
                  fontWeight: 800,
                }}
              >
                <span aria-hidden style={{ fontSize: 30 }}>{ITEM_GLYPHS[word] ?? '💎'}</span>
                <span>{index + 1}. {word}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'input' && (
        <>
          <p style={{ margin: 0, textAlign: 'center', fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 22 }}>
            סדר את האוצרות כדי לפתוח את התיבה
          </p>
          <div style={{ minHeight: 48, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {assembled.length === 0 && <span style={{ color: '#667085' }}>בחר את האוצר הראשון…</span>}
            {assembled.map((index, position) => tile(
              stim.scrambled[index],
              () => setAssembled((items) => items.filter((_, itemPosition) => itemPosition !== position)),
              true,
              `chosen-${position}`,
            ))}
          </div>
          <div aria-hidden style={{ width: '82%', borderTop: '2px dashed #d6a51d' }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {stim.scrambled.map((word, index) => tile(
              word,
              assembled.includes(index) ? undefined : () => setAssembled((items) => [...items, index]),
              false,
              `treasure-${index}`,
            ))}
          </div>
        </>
      )}

      {phase === 'done' && result !== null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', textAlign: 'center' }}>
          {result ? (
            <>
              <CastleChest open />
              <p style={{ margin: 0, fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 22, color: '#243247' }}>
                התיבה נפתחה! האוצר שלך בדרך
              </p>
            </>
          ) : (
            <>
              <FeedbackBanner correct={false} hint="התיבה כמעט נפתחה — ננסה סדר חדש" />
              <p style={{ margin: 0, fontFamily: 'var(--font-head)', color: '#243247' }}>
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
    <svg width="132" height="112" viewBox="0 0 132 112" role="img" aria-label={open ? 'תיבת אוצר פתוחה' : 'תיבת אוצר סגורה'}>
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
  );
}
