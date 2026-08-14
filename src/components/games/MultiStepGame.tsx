import { useEffect, useRef, useState } from 'react';
import type { Challenge } from '../../types';
import type { MultiStepStimulus } from '../../engines/echoes';
import {
  recordSpeechDiagnostic,
  resetSpeechForGesture,
  SPEECH_START_WATCHDOG_MS,
  speak,
  stopSpeech,
} from '../../audio/speech';
import { sfxCorrect, sfxSoft } from '../../audio/sfx';
import { FeedbackBanner } from './common';
import type { GameProps } from './common';
import { TapGlyph } from '../svg/TapIcon';
import { EchoAudioState } from './EchoAudioState';
import {
  EchoCaveChallenge,
  EchoListenButton,
  EchoReplayButton,
  type EchoChallengePhase,
} from './EchoCaveChallenge';

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
  const [replaysLeft, setReplaysLeft] = useState(2);
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

    const failPlayback = (reason: string, cancelSpeech = false) => {
      if (playbackRef.current !== playbackId) return;
      playbackRef.current += 1;
      if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
      recordSpeechDiagnostic('echo-playback-failed', reason);
      if (cancelSpeech) stopSpeech();
      setPhase('audioError');
    };

    const beginInput = () => {
      if (playbackRef.current !== playbackId) return;
      if (!started) {
        failPlayback('ended-before-start', true);
        return;
      }
      if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
      startRef.current = performance.now();
      setPhase('input');
    };

    if (!resetSpeechForGesture()) {
      failPlayback('gesture-reset-unavailable');
      return;
    }

    const startedPlayback = speak(challenge.prompt ?? '', speechRate, {
      onStart: () => {
        if (playbackRef.current !== playbackId) return;
        started = true;
        if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
        playbackTimerRef.current = setTimeout(beginInput, (challenge.prompt?.length ?? 20) * 140 + 1400);
      },
      onEnd: beginInput,
      onError: (reason) => failPlayback(reason ?? 'utterance-error'),
    });

    if (!startedPlayback) {
      failPlayback('speak-not-queued');
      return;
    }
    playbackTimerRef.current = setTimeout(() => {
      if (!started && playbackRef.current === playbackId) {
        failPlayback('start-watchdog-timeout', true);
      }
    }, SPEECH_START_WATCHDOG_MS);
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

  function replay() {
    if (replaysLeft <= 0) return;
    setReplaysLeft((left) => left - 1);
    play();
  }

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
          <p className="ml-echo-ready__instruction">הקשב... ואז החזר את הסדר</p>
          <EchoListenButton onClick={play} />
        </div>
      )}

      {phase === 'playing' && <EchoAudioState state="playing" />}
      {phase === 'audioError' && <EchoAudioState state="error" onRetry={play} />}

      {phase === 'input' && (
        <div className="ml-echo-response">
          <span className="ml-echo-response__eyebrow">עכשיו תורך</span>
          <p className="ml-echo-response__instruction">
            החזר את הסדר <span className="ltr">{tapped.length}/{stim.sequence.length}</span>
          </p>
          <div className="ml-echo-step-grid">
            {stim.board.map((ic) => (
              <button
                key={ic.id}
                type="button"
                onClick={() => tap(ic.id)}
                aria-label={ic.label}
                className={`ml-echo-step ml-pressable${flash === ic.id ? ' ml-echo-step--flash' : ''}`}
              >
                <TapGlyph id={ic.id} />
                <span>{ic.label}</span>
              </button>
            ))}
          </div>
          <EchoReplayButton onClick={replay} remaining={replaysLeft} />
        </div>
      )}

      {phase === 'done' && result !== null && (
        <div className="ml-echo-result">
          <FeedbackBanner correct={result} />
          {!result && (
            <p className="ml-echo-response__instruction">
              הסדר היה:{' '}
              <b style={{ color }}>
                {challenge.answer.map((id) => stim.board.find((b) => b.id === id)?.label).join(' ← ')}
              </b>
            </p>
          )}
        </div>
      )}
    </EchoCaveChallenge>
  );
}
