import { useEffect, useRef, useState } from 'react';
import type {
  Challenge,
  MultiplicationAttemptInput,
  MultiplicationChallengeType,
} from '../../types';
import type {
  DerivedFactStimulus,
  FactLinkStimulus,
  MultiplicationBaseStimulus,
} from '../../engines/connections';
import {
  MULTIPLICATION_FACT_BY_ID,
  type MultiplicationConnection,
  type MultiplicationFact,
} from '../../learning/multiplicationFacts';
import { sfxCorrect, sfxSoft } from '../../audio/sfx';
import { useStore } from '../../state/store';
import {
  CITY_GROWTH_MILESTONE_LIMIT,
  normalizeCityGrowthMilestones,
} from '../../state/cityGrowth';
import { MemoCompanion, type MemoBehavior } from './MemoCompanion';
import type { GameProps } from './common';
import './connections-city.css';

type CityChallenge = Challenge<MultiplicationBaseStimulus | DerivedFactStimulus | FactLinkStimulus, number | string>;
type CityPhase = 'answering' | 'reveal' | 'success';

export const CITY_HINT_ENTRY_COPY = 'רוצה רמז? ממו כאן לעזור';
export const CITY_RETRY_COPY = 'כמעט, נסה שוב';
export const CITY_SUCCESS_COPY = 'מעולה! העיר גדלה';
export const CITY_CORRECT_REVEAL_MS = 1_500;
export const CITY_PERSISTENT_MILESTONES = CITY_GROWTH_MILESTONE_LIMIT;
export const CITY_BUILDING_CONSTRUCTION = 'rise';

export function nextCityHelpLevel(_current: number): number {
  return 1;
}

export function cityHelpLevelAfterWrong(current: number): number {
  return current;
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

export function outcomeAfterWrong(
  helpLevel: number,
  previousDirectMistakes = 0,
): 'retry-same-question' | 'reveal-and-new-question' {
  return helpLevel > 0 || previousDirectMistakes >= 1
    ? 'reveal-and-new-question'
    : 'retry-same-question';
}

function challengeType(id: string): MultiplicationChallengeType {
  if (id.endsWith('.derived')) return 'derived';
  if (id.endsWith('.link')) return 'link';
  return 'direct';
}

export interface CityHintExplanation {
  knownFact: string;
  targetRelationship: string;
  arithmeticQuestion: string;
}

function targetFactorsForConnection(
  fact: MultiplicationFact,
  connection: MultiplicationConnection,
): readonly [number, number] {
  const candidates: readonly (readonly [number, number])[] = [[fact.a, fact.b], [fact.b, fact.a]];
  const score = ([a, b]: readonly [number, number]) => {
    let value = Number(a === connection.sourceA) + Number(b === connection.sourceB);
    if (connection.operation === 'double') {
      if (b === connection.sourceB && a === connection.sourceA * 2) value += 4;
      if (a === connection.sourceA && b === connection.sourceB * 2) value += 4;
    } else if (connection.operation === 'add' || connection.operation === 'subtract') {
      if (b === connection.sourceB && Math.abs(a - connection.sourceA) * b === connection.adjustment) value += 4;
      if (a === connection.sourceA && Math.abs(b - connection.sourceB) * a === connection.adjustment) value += 4;
    }
    return value;
  };
  return score(candidates[1]) > score(candidates[0]) ? candidates[1] : candidates[0];
}

export function buildCityHintExplanation(
  fact: MultiplicationFact,
  connection?: MultiplicationConnection,
): CityHintExplanation {
  if (!connection || connection.sourceFactId === fact.id || connection.operation === 'same') {
    const targetA = fact.a;
    const targetB = fact.b;
    const knownA = Math.max(1, targetA - 1);
    const knownAnswer = knownA * targetB;
    return {
      knownFact: `${knownA} × ${targetB} = ${knownAnswer}`,
      targetRelationship: `${targetA} × ${targetB} = ${knownA} × ${targetB} + ${targetB}`,
      arithmeticQuestion: `${knownAnswer} + ${targetB} = ?`,
    };
  }

  const [targetA, targetB] = targetFactorsForConnection(fact, connection);
  const source = `${connection.sourceA} × ${connection.sourceB}`;
  if (connection.operation === 'double') {
    return {
      knownFact: `${source} = ${connection.sourceAnswer}`,
      targetRelationship: `${targetA} × ${targetB} = ${source} + ${source}`,
      arithmeticQuestion: `${connection.sourceAnswer} + ${connection.sourceAnswer} = ?`,
    };
  }
  const sign = connection.operation === 'add' ? '+' : '-';
  return {
    knownFact: `${source} = ${connection.sourceAnswer}`,
    targetRelationship: `${targetA} × ${targetB} = ${source} ${sign} ${connection.adjustment}`,
    arithmeticQuestion: `${connection.sourceAnswer} ${sign} ${connection.adjustment} = ?`,
  };
}

function isUsefulHintConnection(
  factId: string,
  connection: MultiplicationConnection | undefined,
): connection is MultiplicationConnection {
  return Boolean(connection && connection.sourceFactId !== factId && connection.operation !== 'same');
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
  const persistedMilestones = normalizeCityGrowthMilestones(
    useStore((state) => state.cityGrowthMilestones),
  );
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
  const targetFact = MULTIPLICATION_FACT_BY_ID.get(stimulus.factId);
  const hintExplanation = targetFact
    ? buildCityHintExplanation(targetFact, effectiveConnection)
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

    if (outcomeAfterWrong(helpLevel, mistakes) === 'reveal-and-new-question') {
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
                className={`ml-city-game__help${mistakes >= 1 ? ' is-noticed' : ''}`}
                onClick={requestHint}
              >
                <span aria-hidden>💡</span> {CITY_HINT_ENTRY_COPY}
              </button>
            ) : (
              <div className="ml-city-game__hint-panel" aria-live="polite">
                <div className="ml-city-game__hint-step">
                  <span>כבר ידוע</span>
                  <strong dir="ltr">{hintExplanation?.knownFact}</strong>
                </div>
                <div className="ml-city-game__hint-step">
                  <span>לכן</span>
                  <strong dir="ltr">{hintExplanation?.targetRelationship}</strong>
                </div>
                <div className="ml-city-game__hint-step is-question">
                  <span>כלומר</span>
                  <strong dir="ltr">{hintExplanation?.arithmeticQuestion}</strong>
                </div>
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
