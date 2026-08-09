import type { ReactNode } from 'react';
import { MemoCompanion, type MemoBehavior } from './MemoCompanion';
import './echo-cave-challenge.css';

export type EchoChallengePhase = 'ready' | 'playing' | 'response' | 'error' | 'success' | 'done';

export function EchoCaveChallenge({
  phase,
  children,
}: {
  phase: EchoChallengePhase;
  children: ReactNode;
}) {
  const memoBehavior: MemoBehavior =
    phase === 'playing'
      ? 'listening'
      : phase === 'response' || phase === 'done'
        ? 'thinking'
        : phase === 'success'
          ? 'success'
          : 'idle';

  return (
    <section className={`ml-echo-challenge ml-echo-challenge--${phase}`} aria-label="אתגר במערת ההדים">
      <div className="ml-echo-challenge__world" aria-hidden>
        <span className="ml-echo-challenge__vault ml-echo-challenge__vault--far" />
        <span className="ml-echo-challenge__vault ml-echo-challenge__vault--near" />
        <span className="ml-echo-challenge__halo" />
        <span className="ml-echo-challenge__ring ml-echo-challenge__ring--one" />
        <span className="ml-echo-challenge__ring ml-echo-challenge__ring--two" />
        <span className="ml-echo-challenge__ring ml-echo-challenge__ring--three" />
        <span className="ml-echo-challenge__crystal ml-echo-challenge__crystal--left-one" />
        <span className="ml-echo-challenge__crystal ml-echo-challenge__crystal--left-two" />
        <span className="ml-echo-challenge__crystal ml-echo-challenge__crystal--right-one" />
        <span className="ml-echo-challenge__crystal ml-echo-challenge__crystal--right-two" />
        <span className="ml-echo-challenge__mist ml-echo-challenge__mist--one" />
        <span className="ml-echo-challenge__mist ml-echo-challenge__mist--two" />
        <span className="ml-echo-challenge__tunnel" />
        <span className="ml-echo-challenge__floor" />
        <span className="ml-echo-challenge__water" />
        <span className="ml-echo-challenge__reflection ml-echo-challenge__reflection--one" />
        <span className="ml-echo-challenge__reflection ml-echo-challenge__reflection--two" />
        <span className="ml-echo-challenge__rocks ml-echo-challenge__rocks--left" />
        <span className="ml-echo-challenge__rocks ml-echo-challenge__rocks--right" />
        <MemoCompanion behavior={memoBehavior} className="ml-echo-challenge__memo" />
      </div>

      <div className="ml-echo-challenge__surface">{children}</div>
    </section>
  );
}

export function EchoListenButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="ml-echo-listen-button ml-pressable" onClick={onClick}>
      <span className="ml-echo-listen-button__icon" aria-hidden>
        <EchoSpeakerGlyph />
      </span>
      <span className="ml-echo-listen-button__copy">
        <strong>הקשב</strong>
        <small>המערה מחכה</small>
      </span>
    </button>
  );
}

export function EchoReplayButton({
  onClick,
  remaining,
}: {
  onClick: () => void;
  remaining: number;
}) {
  return (
    <button
      type="button"
      className="ml-echo-replay-button ml-pressable"
      onClick={onClick}
      disabled={remaining <= 0}
    >
      <span className="ml-echo-replay-button__icon" aria-hidden>
        <EchoSpeakerGlyph />
      </span>
      השמע שוב {remaining > 0 ? `(${remaining})` : ''}
    </button>
  );
}

export function EchoSpeakerGlyph() {
  return (
    <svg viewBox="0 0 64 64" focusable="false">
      <path d="M10 27h11l14-12v34L21 37H10z" fill="currentColor" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
      <path d="M43 24c5 5 5 11 0 16M49 18c9 9 9 19 0 28" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
