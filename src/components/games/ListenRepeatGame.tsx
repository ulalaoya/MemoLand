import { useEffect, useRef, useState } from 'react';
import type { Challenge } from '../../types';
import type { ListenRepeatStimulus } from '../../engines/echoes';
import { speak, stopSpeech } from '../../audio/speech';
import { sfxCorrect, sfxSoft } from '../../audio/sfx';
import { FeedbackBanner } from './common';
import type { GameProps } from './common';
import { EchoAudioState } from './EchoAudioState';
import {
  EchoCaveChallenge,
  EchoListenButton,
  EchoReplayButton,
  type EchoChallengePhase,
} from './EchoCaveChallenge';

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
  const [replaysLeft, setReplaysLeft] = useState(2);
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

  function replay() {
    if (replaysLeft <= 0) return;
    setReplaysLeft((left) => left - 1);
    play();
  }

  const tile = (label: string, onClick: (() => void) | undefined, active: boolean, key: React.Key) => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`ml-echo-word ml-pressable${active ? ' ml-echo-word--assembled' : ''}`}
    >
      {label}
    </button>
  );

  const challengePhase: EchoChallengePhase =
    phase === 'audioError'
      ? 'error'
      : phase === 'input'
        ? 'response'
        : phase === 'done' && result
          ? 'success'
          : phase;

  return (
    <EchoCaveChallenge phase={challengePhase}>
      {phase === 'ready' && (
        <div className="ml-echo-ready">
          <span className="ml-echo-ready__eyebrow">אתגר ההד</span>
          <p className="ml-echo-ready__instruction">הקשב... ואז החזר את ההד</p>
          <EchoListenButton onClick={play} />
        </div>
      )}

      {phase === 'playing' && <EchoAudioState state="playing" />}
      {phase === 'audioError' && <EchoAudioState state="error" onRetry={play} />}

      {phase === 'input' && (
        <div className="ml-echo-response">
          <span className="ml-echo-response__eyebrow">עכשיו תורך</span>
          <p className="ml-echo-response__instruction">החזר את ההד לפי הסדר</p>
          <div className="ml-echo-response__well">
            {assembled.length === 0 && <span className="ml-echo-response__placeholder">ההד שלך יופיע כאן...</span>}
            {assembled.map((idx, pos) =>
              tile(stim.scrambled[idx], () => setAssembled((a) => a.filter((_, p) => p !== pos)), true, `a${pos}`),
            )}
          </div>
          <div className="ml-echo-word-bank">
            {stim.scrambled.map((w, i) =>
              tile(w, assembled.includes(i) ? undefined : () => setAssembled((a) => [...a, i]), false, `s${i}`),
            )}
          </div>
          <EchoReplayButton onClick={replay} remaining={replaysLeft} />
        </div>
      )}

      {phase === 'done' && result !== null && (
        <div className="ml-echo-result">
          <FeedbackBanner correct={result} />
          {!result && (
            <p className="ml-echo-response__instruction">
              המשפט היה: <b style={{ color }}>{challenge.answer.join(' ')}</b>
            </p>
          )}
        </div>
      )}
    </EchoCaveChallenge>
  );
}
