import { useEffect, useRef, useState } from 'react';
import type { Challenge } from '../../types';
import type { ListenRepeatStimulus } from '../../engines/echoes';
import { speak, stopSpeech } from '../../audio/speech';
import { sfxCorrect, sfxSoft } from '../../audio/sfx';
import { Button } from '../Button';
import { FeedbackBanner, ReplayButton } from './common';
import type { GameProps } from './common';
import { EchoAudioState } from './EchoAudioState';

type Phase = 'ready' | 'playing' | 'audioError' | 'input' | 'done';

export function ListenRepeatGame({
  challenge,
  color,
  speechRate,
  onResult,
}: GameProps & { challenge: Challenge<ListenRepeatStimulus, string[]> }) {
  const stim = challenge.stimulus;
  const [phase, setPhase] = useState<Phase>('ready');
  const [assembled, setAssembled] = useState<number[]>([]); // אינדקסים ב-scrambled
  const [result, setResult] = useState<boolean | null>(null);
  const startRef = useRef(0);
  const submittedRef = useRef(false);
  const playbackRef = useRef(0);
  const playbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    playbackRef.current += 1;
    if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    stopSpeech();
  }, []);

  useEffect(() => {
    if (phase === 'input' && assembled.length === stim.words.length) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assembled, phase]);

  function play() {
    const playbackId = ++playbackRef.current;
    let started = false;
    if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    setPhase('playing');

    const beginInput = () => {
      if (playbackRef.current !== playbackId) return;
      if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
      startRef.current = performance.now();
      setPhase('input');
    };

    const startedPlayback = speak(stim.words.join(' '), speechRate, {
      onStart: () => {
        if (playbackRef.current !== playbackId) return;
        started = true;
        if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
        playbackTimerRef.current = setTimeout(beginInput, stim.words.length * 1100 + 1200);
      },
      onEnd: beginInput,
      onError: () => {
        if (playbackRef.current !== playbackId) return;
        playbackRef.current += 1;
        if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
        setPhase('audioError');
      },
    });

    if (!startedPlayback) return;
    playbackTimerRef.current = setTimeout(() => {
      if (!started && playbackRef.current === playbackId) {
        playbackRef.current += 1;
        setPhase('audioError');
      }
    }, 2400);
  }

  function submit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const rtMs = performance.now() - startRef.current;
    const given = assembled.map((i) => stim.scrambled[i]);
    const correct = given.length === challenge.answer.length && given.every((w, i) => w === challenge.answer[i]);
    correct ? sfxCorrect() : sfxSoft();
    setResult(correct);
    setPhase('done');
    setTimeout(() => onResult({ correct, rtMs, span: correct ? stim.words.length : undefined }), 1300);
  }

  const tile = (label: string, onClick: (() => void) | undefined, active: boolean, key: React.Key) => (
    <button
      key={key}
      onClick={onClick}
      disabled={!onClick}
      style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        fontSize: 18,
        padding: '10px 14px',
        borderRadius: 12,
        border: `2px solid ${active ? '#fff' : 'var(--gray-300)'}`,
        background: active ? color : 'var(--panel)',
        color: active ? '#fff' : 'var(--ink)',
        boxShadow: '0 3px 0 rgba(36,50,71,.15)',
        opacity: onClick ? 1 : 0.35,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
      {phase === 'ready' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <p style={{ fontSize: 25, fontFamily: 'var(--font-head)', fontWeight: 700, lineHeight: 1.3 }}>הקשב למשפט — ואז הרכב אותו</p>
          <Button variant="green" size="lg" onClick={play} icon="🔊">
            הקשב
          </Button>
        </div>
      )}

      {phase === 'playing' && <EchoAudioState state="playing" />}
      {phase === 'audioError' && <EchoAudioState state="error" onRetry={play} />}

      {phase === 'input' && (
        <>
          {/* המשפט המורכב */}
          <div style={{ minHeight: 50, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {assembled.length === 0 && <span style={{ color: 'var(--gray-300)' }}>בחר מילים לפי הסדר…</span>}
            {assembled.map((idx, pos) =>
              tile(stim.scrambled[idx], () => setAssembled((a) => a.filter((_, p) => p !== pos)), true, `a${pos}`),
            )}
          </div>
          <hr style={{ width: '80%', border: 'none', borderTop: '2px dashed var(--gray-300)' }} />
          {/* אריחי המקור */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {stim.scrambled.map((w, i) =>
              tile(w, assembled.includes(i) ? undefined : () => setAssembled((a) => [...a, i]), false, `s${i}`),
            )}
          </div>
          <ReplayButton
            onReplay={() => speak(stim.words.join(' '), speechRate, { onError: () => setPhase('audioError') })}
            limit={2}
          />
        </>
      )}

      {phase === 'done' && result !== null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <FeedbackBanner correct={result} />
          {!result && (
            <p style={{ fontFamily: 'var(--font-head)', textAlign: 'center' }}>
              המשפט היה: <b style={{ color }}>{challenge.answer.join(' ')}</b>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
