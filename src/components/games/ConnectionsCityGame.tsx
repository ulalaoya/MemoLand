import { useRef, useState } from 'react';
import type { Challenge, MultiplicationAttemptInput, MultiplicationChallengeType } from '../../types';
import type {
  DerivedFactStimulus,
  FactLinkStimulus,
  MultiplicationBaseStimulus,
} from '../../engines/connections';
import { connectionResult, type MultiplicationConnection } from '../../learning/multiplicationFacts';
import { sfxCorrect, sfxSoft } from '../../audio/sfx';
import { useStore } from '../../state/store';
import { MemoCompanion, type MemoBehavior } from './MemoCompanion';
import type { GameProps } from './common';
import './connections-city.css';

type CityChallenge = Challenge<MultiplicationBaseStimulus | DerivedFactStimulus | FactLinkStimulus, number | string>;

const HELP_COPY = [
  '',
  'רוצה למצוא דרך דרך משהו שאתה כבר יודע?',
  'הנה עובדה קשורה שיכולה להיות עוגן.',
  'עכשיו מחברים את העוגן אל העובדה החדשה.',
  'בונים יחד — ואז אתה משלים את הלבנה.',
];

function challengeType(id: string): MultiplicationChallengeType {
  if (id.endsWith('.derived')) return 'derived';
  if (id.endsWith('.link')) return 'link';
  return 'direct';
}

function connectionText(connection: MultiplicationConnection, includeTransformation: boolean): string {
  const base = `${connection.sourceA} × ${connection.sourceB} = ${connection.sourceAnswer}`;
  if (!includeTransformation || connection.operation === 'same') return base;
  if (connection.operation === 'double') return `${base}  ·  פעמיים ${connection.sourceAnswer}`;
  const sign = connection.operation === 'add' ? '+' : '−';
  return `${base}  ·  ${connection.sourceAnswer} ${sign} ${connection.adjustment}`;
}

export function ConnectionsCityGame({ challenge, onResult }: GameProps & { challenge: CityChallenge }) {
  const stimulus = challenge.stimulus;
  const type = challengeType(challenge.exerciseId);
  const [digits, setDigits] = useState<number[]>([]);
  const [helpLevel, setHelpLevel] = useState(type === 'derived' ? 2 : 0);
  const [phase, setPhase] = useState<'answering' | 'success'>('answering');
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<MultiplicationAttemptInput[]>([]);
  const startedAt = useRef(Date.now());
  const multiplication = useStore((state) => state.multiplication);
  const establishedCount = Object.values(multiplication.facts).filter((fact) => fact.stage !== 'DISCOVERING').length;
  const fluentCount = Object.values(multiplication.facts).filter((fact) => fact.stage === 'FLUENT').length;
  const cityTier = Math.min(7, Math.floor((establishedCount + fluentCount) / 6));
  const expectedNumber = stimulus.answer;
  const maxDigits = String(expectedNumber).length;
  const effectiveConnection = stimulus.connection;

  const behavior: MemoBehavior = phase === 'success'
    ? 'success'
    : helpLevel > 0 || digits.length > 0 || selectedLink
      ? 'thinking'
      : 'attentive';

  function record(correct: boolean, usedHelp: number): MultiplicationAttemptInput {
    const direct = type === 'direct' && usedHelp === 0;
    return {
      factId: stimulus.factId,
      challengeType: type,
      correct,
      responseTimeMs: Date.now() - startedAt.current,
      helpLevelUsed: usedHelp,
      mode: direct ? 'direct' : 'derived',
      anchorFactId: effectiveConnection?.sourceFactId,
      at: Date.now(),
    };
  }

  function miss() {
    const event = record(false, helpLevel);
    setAttempts((current) => [...current, event]);
    setHelpLevel((current) => Math.min(4, current + 1));
    setDigits([]);
    setSelectedLink(null);
    sfxSoft();
  }

  function succeed() {
    if (phase === 'success') return;
    const event = record(true, helpLevel);
    const completed = [...attempts, event];
    setAttempts(completed);
    setPhase('success');
    sfxCorrect();
    window.setTimeout(() => {
      onResult({
        correct: true,
        rtMs: Date.now() - startedAt.current,
        multiplicationAttempts: completed,
      });
    }, 920);
  }

  function submitDigits() {
    if (digits.length === 0 || phase === 'success') return;
    const given = Number(digits.join(''));
    if (given === expectedNumber) succeed();
    else miss();
  }

  function chooseLink(factId: string) {
    if (phase === 'success') return;
    setSelectedLink(factId);
    if (factId === challenge.answer) succeed();
    else miss();
  }

  const showAnchor = type === 'derived' || helpLevel >= 2 || phase === 'success';
  const showTransformation = type === 'derived' || helpLevel >= 3 || phase === 'success';
  const showAnswerScaffold = helpLevel >= 4;

  return (
    <section className={`ml-city-game ml-city-game--${phase}`} data-city-tier={cityTier}>
      <div className="ml-city-game__scene" aria-hidden>
        <div className="ml-city-game__sun" />
        <div className="ml-city-game__skyline">
          {Array.from({ length: 7 }).map((_, index) => (
            <span key={index} className={`ml-city-game__building ml-city-game__building--${index + 1}`} data-built={index <= cityTier}>
              <i /><i /><i />
            </span>
          ))}
        </div>
        <div className="ml-city-game__road"><span /></div>
        <MemoCompanion behavior={behavior} className="ml-city-game__memo" />
      </div>

      <div className="ml-city-game__worksite">
        <div className="ml-city-game__eyebrow">
          {type === 'direct' ? 'לבנה חדשה לעיר' : type === 'derived' ? 'בונים מקשר מוכר' : 'מוצאים דרך מועילה'}
        </div>
        <div className={`ml-city-game__equation${helpLevel >= 1 && phase === 'answering' ? ' is-cued' : ''}`} dir="ltr" aria-label={`${stimulus.displayA} כפול ${stimulus.displayB}`}>
          <span>{stimulus.displayA}</span><b>×</b><span>{stimulus.displayB}</span><b>=</b><span className="ml-city-game__unknown">?</span>
        </div>

        {showAnchor && effectiveConnection ? (
          <div className={`ml-city-game__connection${showTransformation ? ' is-open' : ''}`} dir="ltr">
            <span className="ml-city-game__bridge-dot" />
            <strong>{connectionText(effectiveConnection, showTransformation)}</strong>
            {showTransformation ? <span className="ml-city-game__bridge-result">→ {connectionResult(effectiveConnection)}</span> : null}
          </div>
        ) : helpLevel > 0 ? (
          <p className="ml-city-game__help-copy">{HELP_COPY[helpLevel]}</p>
        ) : null}

        {type === 'link' && phase === 'answering' ? (
          <div className="ml-city-game__link-options" aria-label="עובדות שיכולות לעזור">
            {(stimulus as FactLinkStimulus).options.map((option) => (
              <button
                key={option.factId}
                type="button"
                className={`${selectedLink === option.factId ? 'is-selected' : ''}${helpLevel >= 4 && option.factId === challenge.answer ? ' is-assisted' : ''}`.trim()}
                onClick={() => chooseLink(option.factId)}
                dir="ltr"
              >
                <span>{option.a} × {option.b}</span>
                <b>= {option.answer}</b>
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className={`ml-city-game__answer${phase === 'success' ? ' is-built' : ''}`} dir="ltr" aria-live="polite">
              {Array.from({ length: maxDigits }).map((_, index) => (
                <span key={index} className="ml-city-game__answer-brick">
                  {digits[index] ?? (showAnswerScaffold ? String(expectedNumber)[index] : '')}
                </span>
              ))}
            </div>
            <div className="ml-city-game__digit-yard" dir="ltr">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => setDigits((current) => current.length < maxDigits ? [...current, digit] : current)}
                  disabled={phase === 'success'}
                  aria-label={`ספרה ${digit}`}
                >
                  {digit}
                </button>
              ))}
            </div>
            <div className="ml-city-game__actions">
              <button type="button" className="ml-city-game__erase" onClick={() => setDigits((current) => current.slice(0, -1))} disabled={digits.length === 0 || phase === 'success'}>
                מחק
              </button>
              <button type="button" className="ml-city-game__build" onClick={submitDigits} disabled={digits.length === 0 || phase === 'success'}>
                בנה בעיר
              </button>
            </div>
          </>
        )}

        {phase === 'answering' && helpLevel < 4 ? (
          <button type="button" className="ml-city-game__help" onClick={() => setHelpLevel((current) => Math.min(4, current + 1))}>
            ממו, בוא נמצא דרך
          </button>
        ) : null}
        {phase === 'success' ? <div className="ml-city-game__success" role="status">הדרך התחברה לעיר!</div> : null}
      </div>
    </section>
  );
}
