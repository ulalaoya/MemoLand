import { useEffect, useRef, useState } from 'react';
import type {
  Challenge,
  MultiplicationAttemptInput,
  MultiplicationChallengeType,
  MultiplicationProgress,
} from '../../types';
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
type CityPhase = 'answering' | 'reveal' | 'success';

export const CITY_HINT_ENTRY_COPY = 'רוצה רמז? ממו כאן לעזור';
export const CITY_RETRY_COPY = 'כמעט, נסה שוב';
export const CITY_SUCCESS_COPY = 'מעולה! העיר גדלה';
export const CITY_CORRECT_REVEAL_MS = 1_500;
export const CITY_PERSISTENT_MILESTONES = 30;
export const CITY_BUILDING_CONSTRUCTION = 'rise';

export function nextCityHelpLevel(_current: number): number {
  return 1;
}

export function cityHelpLevelAfterWrong(current: number): number {
  return current;
}

export function cityMilestoneCount(progress: MultiplicationProgress): number {
  const correct = Object.values(progress.facts).reduce(
    (sum, fact) => sum + fact.directCorrect + fact.supportedCorrect,
    0,
  );
  return Math.min(CITY_PERSISTENT_MILESTONES, correct);
}

export interface CityMilestoneModel {
  completed: number;
  buildings: readonly boolean[];
  structures: readonly boolean[];
  decorations: readonly boolean[];
  roadUpgrades: readonly boolean[];
  details: readonly boolean[];
}

export function cityMilestoneModel(completed: number): CityMilestoneModel {
  const safe = Math.max(0, Math.min(CITY_PERSISTENT_MILESTONES, Math.floor(completed)));
  const phase = (length: number, firstMilestone: number) => Array.from(
    { length },
    (_, index) => safe >= firstMilestone + index,
  );
  return {
    completed: safe,
    buildings: phase(10, 1),
    structures: phase(5, 11),
    decorations: phase(5, 16),
    roadUpgrades: phase(5, 21),
    details: phase(5, 26),
  };
}

export function outcomeAfterWrong(helpLevel: number): 'retry-same-question' | 'reveal-and-new-question' {
  return helpLevel > 0 ? 'reveal-and-new-question' : 'retry-same-question';
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

export function ConnectionsCityGame({ challenge, onResult }: GameProps & { challenge: CityChallenge }) {
  const stimulus = challenge.stimulus;
  const type = challengeType(challenge.exerciseId);
  const [digits, setDigits] = useState<number[]>([]);
  const [helpLevel, setHelpLevel] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [phase, setPhase] = useState<CityPhase>('answering');
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<MultiplicationAttemptInput[]>([]);
  const startedAt = useRef(Date.now());
  const resultTimer = useRef<number | null>(null);
  const multiplication = useStore((state) => state.multiplication);
  const persistedMilestones = cityMilestoneCount(multiplication);
  const displayedMilestones = Math.min(
    CITY_PERSISTENT_MILESTONES,
    persistedMilestones + (phase === 'success' ? 1 : 0),
  );
  const city = cityMilestoneModel(displayedMilestones);
  const justAddedMilestone = phase === 'success' ? displayedMilestones : 0;
  const expectedNumber = stimulus.answer;
  const maxDigits = String(expectedNumber).length;
  const effectiveConnection = isUsefulHintConnection(stimulus.factId, stimulus.connection)
    ? stimulus.connection
    : undefined;

  useEffect(() => () => {
    if (resultTimer.current !== null) window.clearTimeout(resultTimer.current);
  }, []);

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

  function finishAfter(delayMs: number, callback: () => void) {
    resultTimer.current = window.setTimeout(callback, delayMs);
  }

  function miss() {
    if (phase !== 'answering') return;
    const event = record(false, helpLevel);
    const completed = [...attempts, event];
    setAttempts(completed);
    setDigits([]);
    setSelectedLink(null);
    sfxSoft();

    if (outcomeAfterWrong(helpLevel) === 'reveal-and-new-question') {
      setFeedback(null);
      setPhase('reveal');
      finishAfter(CITY_CORRECT_REVEAL_MS, () => {
        onResult({
          correct: false,
          rtMs: Date.now() - startedAt.current,
          multiplicationAttempts: completed,
          newChallengeAfterIncorrect: true,
        });
      });
      return;
    }

    setHelpLevel((current) => cityHelpLevelAfterWrong(current));
    setFeedback(CITY_RETRY_COPY);
    setMistakes((current) => current + 1);
  }

  function succeed() {
    if (phase !== 'answering') return;
    const event = record(true, helpLevel);
    const completed = [...attempts, event];
    setAttempts(completed);
    setPhase('success');
    setFeedback(null);
    sfxCorrect();
    finishAfter(920, () => {
      onResult({
        correct: true,
        rtMs: Date.now() - startedAt.current,
        multiplicationAttempts: completed,
      });
    });
  }

  function submitDigits() {
    if (digits.length === 0 || phase !== 'answering') return;
    const given = Number(digits.join(''));
    if (given === expectedNumber) succeed();
    else miss();
  }

  function enterDigit(digit: number) {
    if (phase !== 'answering') return;
    setFeedback(null);
    setDigits((current) => current.length < maxDigits ? [...current, digit] : current);
  }

  function eraseDigit() {
    if (phase !== 'answering') return;
    setFeedback(null);
    setDigits((current) => current.slice(0, -1));
  }

  function requestHint() {
    if (phase !== 'answering' || helpLevel > 0) return;
    setFeedback(null);
    setHelpLevel((current) => nextCityHelpLevel(current));
  }

  function chooseLink(factId: string) {
    if (phase !== 'answering') return;
    setSelectedLink(factId);
    if (factId === challenge.answer) succeed();
    else miss();
  }

  return (
    <section className={`ml-city-game ml-city-game--${phase}`} data-city-milestones={persistedMilestones}>
      <div className="ml-city-game__scene" aria-hidden>
        <div className="ml-city-game__sun" />
        <div className="ml-city-game__skyline">
          {city.buildings.map((built, index) => (
            <span key={index} className={`ml-city-game__lot ml-city-game__lot--${index + 1}`}>
              <i className="ml-city-game__foundation" />
              {built ? (
                <span
                  className="ml-city-game__building"
                  data-construction={CITY_BUILDING_CONSTRUCTION}
                  data-just-built={justAddedMilestone === index + 1}
                >
                  <i className="ml-city-game__window" />
                  <i className="ml-city-game__window" />
                  {city.structures[index] ? (
                    <i
                      className="ml-city-game__rooftop"
                      data-just-built={justAddedMilestone === 11 + index}
                    />
                  ) : null}
                  {city.details[index] ? (
                    <i
                      className="ml-city-game__detail"
                      data-just-built={justAddedMilestone === 26 + index}
                    />
                  ) : null}
                </span>
              ) : null}
            </span>
          ))}
        </div>
        <div className="ml-city-game__decorations">
          {city.decorations.map((visible, index) => visible ? (
            <i
              key={index}
              className={index % 2 === 0 ? 'is-tree' : 'is-lamp'}
              data-just-built={justAddedMilestone === 16 + index}
            />
          ) : null)}
        </div>
        <div className="ml-city-game__road">
          {city.roadUpgrades.map((visible, index) => visible ? (
            <i key={index} data-just-built={justAddedMilestone === 21 + index} />
          ) : null)}
        </div>
        <MemoCompanion behavior={behavior} className="ml-city-game__memo" />
      </div>

      <div className="ml-city-game__worksite">
        <div className="ml-city-game__eyebrow">כמה זה?</div>
        <div
          className={`ml-city-game__equation${helpLevel > 0 && phase === 'answering' ? ' is-cued' : ''}${phase === 'reveal' ? ' is-revealed' : ''}`}
          dir="ltr"
          aria-label={`${stimulus.displayA} כפול ${stimulus.displayB}`}
          aria-live={phase === 'reveal' ? 'polite' : undefined}
        >
          <span>{stimulus.displayA}</span><b>×</b><span>{stimulus.displayB}</span><b>=</b>
          <span className="ml-city-game__unknown">{phase === 'reveal' ? expectedNumber : '?'}</span>
        </div>

        {type === 'link' && phase === 'answering' ? (
          <div className="ml-city-game__link-options" aria-label="עובדות שיכולות לעזור">
            {(stimulus as FactLinkStimulus).options.map((option) => (
              <button
                key={option.factId}
                type="button"
                className={selectedLink === option.factId ? 'is-selected' : ''}
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
                  {phase === 'reveal' ? String(expectedNumber)[index] : digits[index] ?? ''}
                </span>
              ))}
            </div>
            {feedback ? <div className="ml-city-game__feedback" role="status">{feedback}</div> : null}
            {phase === 'answering' ? (
              <>
                <div className="ml-city-game__digit-yard" dir="ltr">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => enterDigit(digit)}
                      aria-label={`ספרה ${digit}`}
                    >
                      {digit}
                    </button>
                  ))}
                </div>
                <div className="ml-city-game__actions">
                  <button type="button" className="ml-city-game__erase" onClick={eraseDigit} disabled={digits.length === 0}>
                    מחק
                  </button>
                  <button type="button" className="ml-city-game__build" onClick={submitDigits} disabled={digits.length === 0}>
                    בדיקה
                  </button>
                </div>
              </>
            ) : null}
          </>
        )}

        {phase === 'answering' ? (
          <div className="ml-city-game__help-zone">
            {helpLevel === 0 ? (
              <button
                type="button"
                className={`ml-city-game__help${mistakes >= 2 ? ' is-noticed' : ''}`}
                onClick={requestHint}
              >
                <span aria-hidden>💡</span> {CITY_HINT_ENTRY_COPY}
              </button>
            ) : (
              <div className="ml-city-game__hint-panel" aria-live="polite">
                <div className="ml-city-game__connection" dir="ltr">
                  <span className="ml-city-game__bridge-dot" />
                  <strong>
                    {effectiveConnection
                      ? connectionAnchorText(effectiveConnection)
                      : `${stimulus.displayA} קבוצות של ${stimulus.displayB}`}
                  </strong>
                </div>
                <strong className="ml-city-game__bridge" dir="ltr">
                  {effectiveConnection ? connectionBridgeText(effectiveConnection) : repeatedAdditionText(stimulus)}
                </strong>
              </div>
            )}
          </div>
        ) : null}

        {phase === 'reveal' ? (
          <div className="ml-city-game__reveal" role="status">נזכור ונפגוש אותה שוב בקרוב</div>
        ) : null}
        {phase === 'success' ? <div className="ml-city-game__success" role="status">{CITY_SUCCESS_COPY}</div> : null}
      </div>
    </section>
  );
}
