import { useEffect, useRef, useState } from 'react';
import type { Challenge } from '../../types';
import type { MultiStepStimulus } from '../../engines/echoes';
import { speak, stopSpeech } from '../../audio/speech';
import { sfxCorrect, sfxSoft } from '../../audio/sfx';
import { Button } from '../Button';
import { FeedbackBanner, ReplayButton } from './common';
import type { GameProps } from './common';
import { TapGlyph } from '../svg/TapIcon';
import { EchoAudioState } from './EchoAudioState';

type Phase = 'ready' | 'playing' | 'audioError' | 'input' | 'done';

export function MultiStepGame({
  challenge,
  color,
  speechRate,
  onResult,
}: GameProps & { challenge: Challenge<MultiStepStimulus, string[]> }) {
  const stim = challenge.stimulus;
  const [phase, setPhase] = useState<Phase>('ready');
  const [tapped, setTapped] = useState<string[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const startRef = useRef(0);
  const finishedRef = useRef(false);
  const playbackRef = useRef(0);
  const playbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    playbackRef.current += 1;
    if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    stopSpeech();
  }, []);

  useEffect(() => {
    if (phase === 'input' && tapped.length === stim.sequence.length) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tapped, phase]);

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

    const startedPlayback = speak(challenge.prompt ?? '', speechRate, {
      onStart: () => {
        if (playbackRef.current !== playbackId) return;
        started = true;
        if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
        playbackTimerRef.current = setTimeout(beginInput, (challenge.prompt?.length ?? 20) * 140 + 1400);
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

  function tap(id: string) {
    setFlash(id);
    setTimeout(() => setFlash(null), 180);
    setTapped((t) => [...t, id]);
  }

  function finish() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const rtMs = performance.now() - startRef.current;
    const correct =
      tapped.length === challenge.answer.length && tapped.every((id, i) => id === challenge.answer[i]);
    correct ? sfxCorrect() : sfxSoft();
    setResult(correct);
    setPhase('done');
    setTimeout(() => onResult({ correct, rtMs, span: correct ? stim.sequence.length : undefined }), 1300);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
      {phase === 'ready' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <p style={{ fontSize: 25, fontFamily: 'var(--font-head)', fontWeight: 700, lineHeight: 1.3 }}>הקשב להוראות — ואז בצע לפי הסדר</p>
          <Button variant="green" size="lg" onClick={play} icon="🔊">
            הקשב
          </Button>
        </div>
      )}

      {phase === 'playing' && <EchoAudioState state="playing" />}
      {phase === 'audioError' && <EchoAudioState state="error" onRetry={play} />}

      {(phase === 'input' || phase === 'done') && (
        <>
          {phase === 'input' && (
            <p style={{ fontFamily: 'var(--font-head)', fontWeight: 600 }}>
              נלחצו <span className="ltr">{tapped.length}</span>/<span className="ltr">{stim.sequence.length}</span>
            </p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {stim.board.map((ic) => (
              <button
                key={ic.id}
                disabled={phase !== 'input'}
                onClick={() => tap(ic.id)}
                aria-label={ic.label}
                style={{
                  background: flash === ic.id ? color : 'var(--panel)',
                  border: `3px solid ${flash === ic.id ? '#fff' : 'var(--gray-300)'}`,
                  borderRadius: 16,
                  padding: 12,
                  display: 'grid',
                  placeItems: 'center',
                  gap: 4,
                  boxShadow: '0 3px 0 rgba(36,50,71,.15)',
                  transition: 'transform .1s',
                  transform: flash === ic.id ? 'scale(1.08)' : 'scale(1)',
                }}
              >
                <TapGlyph id={ic.id} />
                <span style={{ fontSize: 13, fontWeight: 600, color: flash === ic.id ? '#fff' : 'var(--ink)' }}>{ic.label}</span>
              </button>
            ))}
          </div>
          {phase === 'input' && (
            <ReplayButton
              onReplay={() => speak(challenge.prompt ?? '', speechRate, { onError: () => setPhase('audioError') })}
              limit={2}
            />
          )}
        </>
      )}

      {phase === 'done' && result !== null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          <FeedbackBanner correct={result} />
          {!result && (
            <p style={{ fontFamily: 'var(--font-head)', textAlign: 'center' }}>
              הסדר היה:{' '}
              <b style={{ color }}>
                {challenge.answer.map((id) => stim.board.find((b) => b.id === id)?.label).join(' ← ')}
              </b>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
