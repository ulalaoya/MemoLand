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
import { sfxCorrect, sfxLevelUp, sfxSoft } from '../../audio/sfx';
import { useStore } from '../../state/store';
import {
  CITY_DISTRICT_BACK_ROW_SIZE,
  CITY_DISTRICT_BUILDING_COUNT,
  CITY_DISTRICT_FRONT_ROW_SIZE,
  cityDistrictProgress,
  normalizeCityGrowthMilestones,
} from '../../state/cityGrowth';
import { MemoCompanion, type MemoBehavior } from './MemoCompanion';
import type { GameProps } from './common';
import './connections-city.css';

type CityChallenge = Challenge<MultiplicationBaseStimulus | DerivedFactStimulus | FactLinkStimulus, number | string>;
type CityPhase = 'answering' | 'reveal' | 'success';

export const CITY_HINT_ENTRY_COPY = 'רוצה רמז? ממו כאן לעזור';
export const CITY_RETRY_COPY = 'כמעט, נסה שוב';
export const CITY_SUCCESS_COPY = 'מצוין, העיר גדלה!';
export const CITY_CORRECT_REVEAL_MS = 1_500;
export const CITY_PROJECT_COMPLETE_MS = 2_600;
export const CITY_DISTRICT_CAPACITY = CITY_DISTRICT_BUILDING_COUNT;
export const CITY_PUZZLE_COLUMNS = 5;
export const CITY_PUZZLE_ROWS = 3;

export type CityBuildProjectKind =
  | 'city'
  | 'blocks'
  | 'race-car'
  | 'rocket'
  | 'castle'
  | 'pirate-ship'
  | 'robot'
  | 'dinosaur'
  | 'airplane'
  | 'train'
  | 'amusement-park'
  | 'treehouse'
  | 'submarine'
  | 'space-station'
  | 'ice-palace'
  | 'fire-station'
  | 'farm'
  | 'aquarium'
  | 'planet-base'
  | 'dragon'
  | 'balloon'
  | 'crane'
  | 'candy-factory'
  | 'safari-jeep'
  | 'lighthouse'
  | 'music-stage'
  | 'snowman'
  | 'skate-park'
  | 'magic-library'
  | 'moon-rover';

export interface CityBuildProject {
  kind: CityBuildProjectKind;
  title: string;
  icon: string;
  rowCopy: string;
  completeCopy: string;
}

const CITY_BUILD_PROJECTS: readonly CityBuildProject[] = [
  {
    kind: 'city',
    title: 'בונים עיר',
    icon: '🏙️',
    rowCopy: CITY_SUCCESS_COPY,
    completeCopy: 'כל הכבוד! סיימת לבנות את העיר!',
  },
  {
    kind: 'blocks',
    title: 'בונים פסל לגו',
    icon: '🧱',
    rowCopy: 'מצוין, פסל הלגו מתקדם!',
    completeCopy: 'כל הכבוד! סיימת לבנות את פסל הלגו!',
  },
  {
    kind: 'race-car',
    title: 'מרכיבים מכונית מרוץ',
    icon: '🏎️',
    rowCopy: 'מצוין, מכונית המרוץ מתקדמת!',
    completeCopy: 'כל הכבוד! מכונית המרוץ מוכנה!',
  },
  { kind: 'rocket', title: 'בונים טיל לחלל', icon: '🚀', rowCopy: 'מצוין, הטיל כמעט מוכן!', completeCopy: 'כל הכבוד! הטיל מוכן לשיגור!' },
  { kind: 'castle', title: 'בונים טירה', icon: '🏰', rowCopy: 'מצוין, הטירה מתרוממת!', completeCopy: 'כל הכבוד! הטירה הושלמה!' },
  { kind: 'pirate-ship', title: 'בונים ספינת פיראטים', icon: '⛵', rowCopy: 'מצוין, הספינה מקבלת צורה!', completeCopy: 'כל הכבוד! הספינה מוכנה להפלגה!' },
  { kind: 'robot', title: 'מרכיבים רובוט', icon: '🤖', rowCopy: 'מצוין, הרובוט מתעורר!', completeCopy: 'כל הכבוד! הרובוט מוכן לפעולה!' },
  { kind: 'dinosaur', title: 'בונים דינוזאור', icon: '🦕', rowCopy: 'מצוין, הדינוזאור גדל!', completeCopy: 'כל הכבוד! הדינוזאור הושלם!' },
  { kind: 'airplane', title: 'בונים מטוס', icon: '✈️', rowCopy: 'מצוין, המטוס כמעט מוכן!', completeCopy: 'כל הכבוד! המטוס מוכן להמראה!' },
  { kind: 'train', title: 'בונים רכבת', icon: '🚂', rowCopy: 'מצוין, הרכבת מתארכת!', completeCopy: 'כל הכבוד! הרכבת מוכנה לנסיעה!' },
  { kind: 'amusement-park', title: 'בונים פארק שעשועים', icon: '🎡', rowCopy: 'מצוין, הפארק מתמלא!', completeCopy: 'כל הכבוד! פארק השעשועים הושלם!' },
  { kind: 'treehouse', title: 'בונים בית על העץ', icon: '🌳', rowCopy: 'מצוין, בית העץ מתרומם!', completeCopy: 'כל הכבוד! בית העץ הושלם!' },
  { kind: 'submarine', title: 'בונים צוללת', icon: '🌊', rowCopy: 'מצוין, הצוללת מקבלת צורה!', completeCopy: 'כל הכבוד! הצוללת מוכנה לצלילה!' },
  { kind: 'space-station', title: 'בונים תחנת חלל', icon: '🛰️', rowCopy: 'מצוין, התחנה מתרחבת!', completeCopy: 'כל הכבוד! תחנת החלל הושלמה!' },
  { kind: 'ice-palace', title: 'בונים ארמון קרח', icon: '❄️', rowCopy: 'מצוין, ארמון הקרח נוצץ!', completeCopy: 'כל הכבוד! ארמון הקרח הושלם!' },
  { kind: 'fire-station', title: 'בונים תחנת כיבוי', icon: '🚒', rowCopy: 'מצוין, תחנת הכיבוי מתקדמת!', completeCopy: 'כל הכבוד! תחנת הכיבוי מוכנה!' },
  { kind: 'farm', title: 'בונים חווה', icon: '🚜', rowCopy: 'מצוין, החווה מתמלאת!', completeCopy: 'כל הכבוד! החווה הושלמה!' },
  { kind: 'aquarium', title: 'בונים אקווריום', icon: '🐠', rowCopy: 'מצוין, האקווריום מתמלא!', completeCopy: 'כל הכבוד! האקווריום הושלם!' },
  { kind: 'planet-base', title: 'בונים בסיס בכוכב', icon: '🪐', rowCopy: 'מצוין, הבסיס מתרחב!', completeCopy: 'כל הכבוד! הבסיס בכוכב הושלם!' },
  { kind: 'dragon', title: 'בונים דרקון', icon: '🐉', rowCopy: 'מצוין, הדרקון מתעורר!', completeCopy: 'כל הכבוד! הדרקון הושלם!' },
  { kind: 'balloon', title: 'בונים כדור פורח', icon: '🎈', rowCopy: 'מצוין, הכדור מתנפח!', completeCopy: 'כל הכבוד! הכדור הפורח מוכן!' },
  { kind: 'crane', title: 'בונים מנוף ענק', icon: '🏗️', rowCopy: 'מצוין, המנוף מתרומם!', completeCopy: 'כל הכבוד! המנוף הענק הושלם!' },
  { kind: 'candy-factory', title: 'בונים מפעל ממתקים', icon: '🍭', rowCopy: 'מצוין, המפעל מתמלא!', completeCopy: 'כל הכבוד! מפעל הממתקים הושלם!' },
  { kind: 'safari-jeep', title: 'בונים ג׳יפ ספארי', icon: '🚙', rowCopy: 'מצוין, הג׳יפ מקבל צורה!', completeCopy: 'כל הכבוד! ג׳יפ הספארי מוכן!' },
  { kind: 'lighthouse', title: 'בונים מגדלור', icon: '💡', rowCopy: 'מצוין, המגדלור עולה!', completeCopy: 'כל הכבוד! המגדלור מאיר!' },
  { kind: 'music-stage', title: 'בונים במת מוזיקה', icon: '🎸', rowCopy: 'מצוין, הבמה מתקדמת!', completeCopy: 'כל הכבוד! במת המוזיקה מוכנה!' },
  { kind: 'snowman', title: 'בונים איש שלג', icon: '⛄', rowCopy: 'מצוין, איש השלג גדל!', completeCopy: 'כל הכבוד! איש השלג הושלם!' },
  { kind: 'skate-park', title: 'בונים פארק גלישה', icon: '🛹', rowCopy: 'מצוין, המסלול מתרחב!', completeCopy: 'כל הכבוד! פארק הגלישה הושלם!' },
  { kind: 'magic-library', title: 'בונים ספרייה קסומה', icon: '📚', rowCopy: 'מצוין, הספרייה מתמלאת!', completeCopy: 'כל הכבוד! הספרייה הקסומה הושלמה!' },
  { kind: 'moon-rover', title: 'בונים רכב ירח', icon: '🌙', rowCopy: 'מצוין, רכב הירח מתקדם!', completeCopy: 'כל הכבוד! רכב הירח מוכן!' },
] as const;

export const CITY_BUILD_PROJECT_COUNT = CITY_BUILD_PROJECTS.length;

export function cityBuildProject(projectIndex: number): CityBuildProject {
  return CITY_BUILD_PROJECTS[projectIndex % CITY_BUILD_PROJECTS.length];
}

export function cityProjectCelebration(totalBuilt: number): string | null {
  if (totalBuilt <= 0) return null;
  const model = cityDistrictProgress(totalBuilt);
  const project = cityBuildProject(model.districtIndex);
  if (model.districtComplete) return project.completeCopy;
  return model.builtCount === CITY_DISTRICT_BACK_ROW_SIZE ? project.rowCopy : null;
}

export function citySuccessDelay(totalBuilt: number): number {
  return cityDistrictProgress(totalBuilt).districtComplete ? CITY_PROJECT_COMPLETE_MS : 920;
}

export function nextCityHelpLevel(_current: number): number {
  return 1;
}

export function cityHelpLevelAfterWrong(current: number): number {
  return current;
}

export interface CityDistrictModel {
  totalBuilt: number;
  completedDistricts: number;
  districtIndex: number;
  districtNumber: number;
  builtCount: number;
  districtComplete: boolean;
  backRow: readonly boolean[];
  frontRow: readonly boolean[];
}

export function cityDistrictModel(completed: number): CityDistrictModel {
  const progress = cityDistrictProgress(completed);
  return {
    ...progress,
    backRow: Array.from(
      { length: CITY_DISTRICT_BACK_ROW_SIZE },
      (_, index) => progress.builtCount >= index + 1,
    ),
    frontRow: Array.from(
      { length: CITY_DISTRICT_FRONT_ROW_SIZE },
      (_, index) => progress.builtCount >= CITY_DISTRICT_BACK_ROW_SIZE + index + 1,
    ),
  };
}

export function cityProjectDisplayModel(
  completed: number,
  preserveCompletedProject = false,
): CityDistrictModel {
  const normalized = normalizeCityGrowthMilestones(completed);
  if (!preserveCompletedProject && normalized > 0 && normalized % CITY_DISTRICT_CAPACITY === 0) {
    const nextProject = cityDistrictModel(normalized + 1);
    return {
      ...nextProject,
      totalBuilt: normalized,
      builtCount: 0,
      districtComplete: false,
      backRow: Array(CITY_DISTRICT_BACK_ROW_SIZE).fill(false),
      frontRow: Array(CITY_DISTRICT_FRONT_ROW_SIZE).fill(false),
    };
  }
  return cityDistrictModel(normalized);
}

export function cityPuzzlePiecePath(index: number): string {
  const column = index % CITY_PUZZLE_COLUMNS;
  const row = Math.floor(index / CITY_PUZZLE_COLUMNS);
  const width = 300 / CITY_PUZZLE_COLUMNS;
  const height = 150 / CITY_PUZZLE_ROWS;
  const x = column * width;
  const y = row * height;
  const tabHalf = 9;
  const tabDepth = 8;
  const middleX = x + width / 2;
  const middleY = y + height / 2;
  const topBend = (row + column) % 2 === 0 ? tabDepth : -tabDepth;
  const rightBend = (row + column) % 2 === 0 ? tabDepth : -tabDepth;
  const bottomBend = (row + column + 1) % 2 === 0 ? tabDepth : -tabDepth;
  const leftBend = (row + column) % 2 === 0 ? -tabDepth : tabDepth;

  let path = `M ${x} ${y}`;
  path += row === 0
    ? ` H ${x + width}`
    : ` H ${middleX - tabHalf} C ${middleX - tabHalf} ${y + topBend} ${middleX + tabHalf} ${y + topBend} ${middleX + tabHalf} ${y} H ${x + width}`;
  path += column === CITY_PUZZLE_COLUMNS - 1
    ? ` V ${y + height}`
    : ` V ${middleY - tabHalf} C ${x + width + rightBend} ${middleY - tabHalf} ${x + width + rightBend} ${middleY + tabHalf} ${x + width} ${middleY + tabHalf} V ${y + height}`;
  path += row === CITY_PUZZLE_ROWS - 1
    ? ` H ${x}`
    : ` H ${middleX + tabHalf} C ${middleX + tabHalf} ${y + height + bottomBend} ${middleX - tabHalf} ${y + height + bottomBend} ${middleX - tabHalf} ${y + height} H ${x}`;
  path += column === 0
    ? ` V ${y}`
    : ` V ${middleY + tabHalf} C ${x + leftBend} ${middleY + tabHalf} ${x + leftBend} ${middleY - tabHalf} ${x} ${middleY - tabHalf} V ${y}`;
  return `${path} Z`;
}

function ProjectPuzzle({
  project,
  builtCount,
  justAdded,
}: {
  project: CityBuildProject;
  builtCount: number;
  justAdded: number;
}) {
  const artId = `ml-city-puzzle-art-${project.kind}`;
  const gradientId = `ml-city-puzzle-gradient-${project.kind}`;
  const pieces = Array.from({ length: CITY_DISTRICT_BUILDING_COUNT }, (_, index) => ({
    part: index + 1,
    path: cityPuzzlePiecePath(index),
  }));

  return (
    <svg className="ml-city-game__puzzle" viewBox="0 0 300 150" role="img" aria-label={`${project.title}, ${builtCount} מתוך 15 חלקים`}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--project-alt, #dff7f5)" />
          <stop offset="100%" stopColor="var(--project-main, #4e9fd8)" />
        </linearGradient>
        <g id={artId}>
          <rect width="300" height="150" rx="18" fill={`url(#${gradientId})`} />
          <circle cx="42" cy="31" r="20" fill="rgba(255,255,255,.42)" />
          <circle cx="263" cy="120" r="29" fill="rgba(255,255,255,.18)" />
          <circle cx="245" cy="24" r="5" fill="rgba(255,255,255,.72)" />
          <circle cx="265" cy="42" r="3" fill="rgba(255,255,255,.66)" />
          <text className="ml-city-game__puzzle-icon" x="150" y="118" textAnchor="middle">{project.icon}</text>
        </g>
        {pieces.map(({ part, path }) => (
          <clipPath key={part} id={`ml-city-puzzle-clip-${project.kind}-${part}`}>
            <path d={path} />
          </clipPath>
        ))}
      </defs>
      <rect className="ml-city-game__puzzle-board" width="300" height="150" rx="18" />
      {pieces.map(({ part, path }) => {
        const built = builtCount >= part;
        return (
          <g
            key={part}
            className={`ml-city-game__puzzle-piece ml-city-game__piece${built ? ' is-built' : ''}${justAdded === part ? ' is-just-built' : ''}`}
            data-part={part}
          >
            <path className="ml-city-game__puzzle-slot" d={path} />
            <use
              className="ml-city-game__puzzle-art"
              href={`#${artId}`}
              clipPath={`url(#ml-city-puzzle-clip-${project.kind}-${part})`}
            />
            <path className="ml-city-game__puzzle-outline" d={path} />
          </g>
        );
      })}
    </svg>
  );
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
  if (fact.a === 1) {
    return {
      knownFact: `${fact.b} × 1 = ${fact.b}`,
      targetRelationship: `1 × ${fact.b} = ${fact.b} × 1`,
      arithmeticQuestion: `1 × ${fact.b} = ?`,
    };
  }
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
  const savedMilestones = useStore((state) => state.cityGrowthMilestones);
  // Keep the optimistic building stable until this question unmounts.
  const [persistedMilestones] = useState(() => normalizeCityGrowthMilestones(savedMilestones));
  const displayedMilestones = normalizeCityGrowthMilestones(
    persistedMilestones + (phase === 'success' ? 1 : 0),
  );
  const completingProject = phase === 'success'
    && cityDistrictProgress(displayedMilestones).districtComplete;
  const city = cityProjectDisplayModel(displayedMilestones, completingProject);
  const project = cityBuildProject(city.districtIndex);
  const celebration = phase === 'success' ? cityProjectCelebration(displayedMilestones) : null;
  const justAddedPart = phase === 'success' ? city.builtCount : 0;
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
    if (cityDistrictProgress(persistedMilestones + 1).districtComplete) sfxLevelUp();
    else sfxCorrect();
    finishAfter(citySuccessDelay(persistedMilestones + 1), () => {
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
    <section
      className={`ml-city-game ml-city-game--${phase}${helpLevel > 0 && phase === 'answering' ? ' is-hint-open' : ''}`}
      data-city-milestones={persistedMilestones}
      data-city-district={city.districtIndex}
      data-city-district-built={city.builtCount}
      data-city-district-complete={city.districtComplete}
      data-city-project={project.kind}
    >
      <div className={`ml-city-game__scene${city.districtComplete ? ' is-district-complete' : ''}`} aria-hidden>
        <div className="ml-city-game__sun" />
        <div className="ml-city-game__district-label">{project.icon} {project.title}</div>
        <ProjectPuzzle project={project} builtCount={city.builtCount} justAdded={justAddedPart} />
        {phase === 'success' && city.districtComplete ? (
          <div className="ml-city-game__project-complete">
            <span>{project.icon}</span>
            <strong>{project.completeCopy}</strong>
          </div>
        ) : null}
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
                <div className="ml-city-game__calculator" dir="ltr" aria-label="מקלדת מחשבון">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => enterDigit(digit)}
                      aria-label={`ספרה ${digit}`}
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="ml-city-game__backspace"
                    onClick={eraseDigit}
                    disabled={digits.length === 0}
                    aria-label="מחיקת ספרה אחרונה"
                  >
                    <span aria-hidden>⌫</span>
                  </button>
                  <button type="button" onClick={() => enterDigit(0)} aria-label="ספרה 0">0</button>
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
        {celebration ? (
          <div className={`ml-city-game__success${city.districtComplete ? ' is-project-complete' : ''}`} role="status" aria-live="assertive">
            {celebration}
          </div>
        ) : null}
      </div>
    </section>
  );
}
