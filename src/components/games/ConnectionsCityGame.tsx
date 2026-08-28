import { useRef, useState } from 'react';
import type { Challenge, MultiplicationAttemptInput, MultiplicationChallengeType } from '../../types';
import type {
  DerivedFactStimulus,
  FactLinkStimulus,
  MultiplicationBaseStimulus,
} from '../../engines/connections';
import type { MultiplicationConnection } from '../../learning/multiplicationFacts';
import { sfxCorrect, sfxSoft } from '../../audio/sfx';
import { useStore } from '../../state/store';
import { MemoCompanion, type MemoBehavior } from './MemoCompanion';
import type { GameProps } from './common';
import './connections-city.css';

type CityChallenge = Challenge<MultiplicationBaseStimulus | DerivedFactStimulus | FactLinkStimulus, number | string>;
type CityPhase = 'answering' | 'success';

export const CITY_HINT_ENTRY_COPY = 'רוצה רמז? ממו כאן לעזור';
export const CITY_RETRY_COPY = 'כמעט, נסה שוב';

export function nextCityHelpLevel(current: number): number {
  return Math.min(4, current + 1);
}

export function cityHelpLevelAfterWrong(current: number): number {
  return current;
}

export function visibleCityTier(baseTier: number, phase: CityPhase): number {
  return Math.min(6, baseTier + (phase === 'success' ? 1 : 0));
}

function challengeType(id: string): MultiplicationChallengeType {
  if (id.endsWith('.derived')) return 'derived';
  if (id.endsWith('.link')) return 'link';
  return 'direct';
}

export function connectionAnchorText(connection: MultiplicationConnection): string {
  return `${connection.sourceA} × ${connection.sourceB} = ${connection.sourceAnswer}`;
}

export function connectionBridgeText(connection: MultiplicationConnection): string {
  if (connection.operation === 'double') return `${connection.sourceAnswer} + ${connection.sourceAnswer} = ?`;
  const sign = connection.operation === 'add' ? '+' : '−';
  return `${connection.sourceAnswer} ${sign} ${connection.adjustment} = ?`;
}

function isUsefulHintConnection(
  factId: string,
  connection: MultiplicationConnection | undefined,
): connection is MultiplicationConnection {
  return Boolean(connection && connection.sourceFactId !== factId && connection.operation !== 'same');
}

function repeatedAdditionText(stimulus: MultiplicationBaseStimulus): string {
  return `${Array.from({ length: stimulus.displayA }, () => stimulus.displayB).join(' + ')} = ?`;
}

function VisualHint({
  connection,
  stimulus,
}: {
  connection: MultiplicationConnection | undefined;
  stimulus: MultiplicationBaseStimulus;
}) {
  if (connection) {
    const pieces = connection.operation === 'double'
      ? [connection.sourceAnswer, connection.sourceAnswer]
      : [connection.sourceAnswer, connection.adjustment];
    const sign = connection.operation === 'subtract' ? '−' : '+';
    return (
      <div className="ml-city-game__visual-hint" dir="ltr" aria-label={connectionBridgeText(connection)}>
        <span>{pieces[0]}</span><b>{sign}</b><span>{pieces[1]}</span><b>= ?</b>
      </div>
    );
  }
  return (
    <div className="ml-city-game__groups" dir="ltr" aria-label={`${stimulus.displayA} קבוצות של ${stimulus.displayB}`}>
      {Array.from({ length: stimulus.displayA }).map((_, group) => (
        <span key={group}>
          {Array.from({ length: stimulus.displayB }).map((__, dot) => <i key={dot} />)}
        </span>
      ))}
    </div>
  );
}

export function ConnectionsCityGame({ challenge, onResult }: GameProps & { challenge: CityChallenge }) {
  const stimulus = challenge.stimulus;
  const type = challengeType(challenge.exerciseId);
  const [digits, setDigits] = useState<number[]>([]);
  const [helpLevel, setHelpLevel] = useState(0);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [phase, setPhase] = useState<CityPhase>('answering');
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<MultiplicationAttemptInput[]>([]);
  const startedAt = useRef(Date.now());
  const multiplication = useStore((state) => state.multiplication);
  const establishedCount = Object.values(multiplication.facts).filter((fact) => fact.stage !== 'DISCOVERING').length;
  const fluentCount = Object.values(multiplication.facts).filter((fact) => fact.stage === 'FLUENT').length;
  const cityTier = Math.min(7, Math.floor((establishedCount + fluentCount) / 6));
  const displayedCityTier = visibleCityTier(cityTier, phase);
  const expectedNumber = stimulus.answer;
  const maxDigits = String(expectedNumber).length;
  const effectiveConnection = isUsefulHintConnection(stimulus.factId, stimulus.connection)
    ? stimulus.connection
    : undefined;

  const behavior: MemoBehavior = phase === 'success'
    ? 'success'
    : feedback || helpLevel > 0 || digits.length > 0 || selectedLink
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
      anchorFactId: usedHelp > 0 ? effectiveConnection?.sourceFactId : undefined,
      at: Date.now(),
    };
  }

  function miss() {
    const event = record(false, helpLevel);
    setAttempts((current) => [...current, event]);
    setHelpLevel((current) => cityHelpLevelAfterWrong(current));
    setDigits([]);
    setSelectedLink(null);
    setFeedback(CITY_RETRY_COPY);
    setMistakes((current) => current + 1);
    sfxSoft();
  }

  function succeed() {
    if (phase === 'success') return;
    const event = record(true, helpLevel);
    const completed = [...attempts, event];
    setAttempts(completed);
    setPhase('success');
    setFeedback(null);
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

  function enterDigit(digit: number) {
    if (phase === 'success') return;
    setFeedback(null);
    setAnswerRevealed(false);
    setDigits((current) => {
      const base = answerRevealed ? [] : current;
      return base.length < maxDigits ? [...base, digit] : base;
    });
  }

  function eraseDigit() {
    setFeedback(null);
    setAnswerRevealed(false);
    setDigits((current) => answerRevealed ? [] : current.slice(0, -1));
  }

  function requestHint() {
    setFeedback(null);
    setHelpLevel((current) => {
      const next = nextCityHelpLevel(current);
      if (next === 4) {
        setDigits([]);
        setAnswerRevealed(true);
      }
      return next;
    });
  }

  function chooseLink(factId: string) {
    if (phase === 'success') return;
    setSelectedLink(factId);
    if (factId === challenge.answer) succeed();
    else miss();
  }

  const showAnchor = helpLevel >= 1;
  const showTransformation = helpLevel >= 2;
  const showVisualHint = helpLevel >= 3;

  return (
    <section className={`ml-city-game ml-city-game--${phase}`} data-city-tier={cityTier}>
      <div className="ml-city-game__scene" aria-hidden>
        <div className="ml-city-game__sun" />
        <div className="ml-city-game__city-progress">
          <strong>העיר שלי</strong>
          <span>
            {Array.from({ length: 7 }).map((_, index) => <i key={index} data-grown={index <= displayedCityTier} />)}
          </span>
        </div>
        <div className="ml-city-game__skyline">
          {Array.from({ length: 7 }).map((_, index) => (
            <span
              key={index}
              className={`ml-city-game__building ml-city-game__building--${index + 1}`}
              data-built={index <= displayedCityTier}
              data-just-built={phase === 'success' && index === displayedCityTier}
            >
              <i /><i /><i />
            </span>
          ))}
        </div>
        <div className="ml-city-game__road"><span /></div>
        <MemoCompanion behavior={behavior} className="ml-city-game__memo" />
      </div>

      <div className="ml-city-game__worksite">
        <div className="ml-city-game__eyebrow">כמה זה?</div>
        <div className={`ml-city-game__equation${helpLevel >= 1 && phase === 'answering' ? ' is-cued' : ''}`} dir="ltr" aria-label={`${stimulus.displayA} כפול ${stimulus.displayB}`}>
          <span>{stimulus.displayA}</span><b>×</b><span>{stimulus.displayB}</span><b>=</b><span className="ml-city-game__unknown">?</span>
        </div>

        {phase === 'answering' && helpLevel > 0 ? (
          <div className="ml-city-game__hint-panel" aria-live="polite">
            {showAnchor && effectiveConnection ? (
              <div className="ml-city-game__connection" dir="ltr">
                <span className="ml-city-game__bridge-dot" />
                <strong>{connectionAnchorText(effectiveConnection)}</strong>
              </div>
            ) : showAnchor ? (
              <VisualHint connection={undefined} stimulus={stimulus} />
            ) : null}
            {showTransformation ? (
              <strong className="ml-city-game__bridge" dir="ltr">
                {effectiveConnection ? connectionBridgeText(effectiveConnection) : repeatedAdditionText(stimulus)}
              </strong>
            ) : null}
            {showVisualHint && effectiveConnection ? <VisualHint connection={effectiveConnection} stimulus={stimulus} /> : null}
            {answerRevealed ? (
              <div className="ml-city-game__final-help">
                <strong dir="ltr">{stimulus.displayA} × {stimulus.displayB} = {expectedNumber}</strong>
                <span>כשתתחיל להקליד, התשובה תיסגר</span>
              </div>
            ) : null}
          </div>
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
                  {digits[index] ?? ''}
                </span>
              ))}
            </div>
            {feedback ? <div className="ml-city-game__feedback" role="status">{feedback}</div> : null}
            <div className="ml-city-game__digit-yard" dir="ltr">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => enterDigit(digit)}
                  disabled={phase === 'success'}
                  aria-label={`ספרה ${digit}`}
                >
                  {digit}
                </button>
              ))}
            </div>
            <div className="ml-city-game__actions">
              <button type="button" className="ml-city-game__erase" onClick={eraseDigit} disabled={digits.length === 0 || phase === 'success'}>
                מחק
              </button>
              <button type="button" className="ml-city-game__build" onClick={submitDigits} disabled={digits.length === 0 || phase === 'success'}>
                בדיקה
              </button>
            </div>
          </>
        )}

        {phase === 'answering' && helpLevel < 4 ? (
          <button
            type="button"
            className={`ml-city-game__help${mistakes >= 2 ? ' is-noticed' : ''}`}
            onClick={requestHint}
          >
            <span aria-hidden>💡</span> {helpLevel === 0 ? CITY_HINT_ENTRY_COPY : 'עוד רמז'}
          </button>
        ) : null}
        {phase === 'success' ? <div className="ml-city-game__success" role="status">מעולה! העיר גדלה</div> : null}
      </div>
    </section>
  );
}
