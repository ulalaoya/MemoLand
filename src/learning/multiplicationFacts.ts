import type {
  MultiplicationFactId,
  MultiplicationProgress,
  MultiplicationStage,
} from '../types';
import type { Rng } from '../engines/rng';

export type MultiplicationConnectionKind = 'commutativity' | 'double' | 'fives' | 'tens' | 'neighbor';

export interface MultiplicationConnection {
  kind: MultiplicationConnectionKind;
  sourceFactId: MultiplicationFactId;
  sourceA: number;
  sourceB: number;
  sourceAnswer: number;
  operation: 'same' | 'double' | 'add' | 'subtract';
  adjustment: number;
}

export interface MultiplicationFact {
  id: MultiplicationFactId;
  a: number;
  b: number;
  answer: number;
  introducedAtLevel: number;
  connections: MultiplicationConnection[];
}

/**
 * פיילוט Beta: 45 עובדות קנוניות בלבד. ברמות 13–15 אין עובדות חדשות;
 * הן משמשות לביסוס, חזרות במרווחים ושליפה רחבה.
 */
export const MULTIPLICATION_LEVEL_FACTS: readonly (readonly [number, number][])[] = [
  [[2, 2], [2, 3], [2, 4], [2, 5]],
  [[5, 5], [5, 6], [5, 10], [2, 10]],
  [[2, 6], [2, 7], [2, 8], [2, 9]],
  [[5, 7], [5, 8], [5, 9], [3, 10], [4, 10]],
  [[3, 3], [3, 4], [3, 5], [3, 6]],
  [[3, 7], [3, 8], [3, 9], [6, 10]],
  [[4, 4], [4, 5], [4, 6], [4, 7]],
  [[4, 8], [4, 9], [7, 10], [8, 10]],
  [[6, 6], [6, 7], [6, 8], [6, 9]],
  [[9, 9], [9, 10], [10, 10]],
  [[7, 7], [7, 8], [7, 9]],
  [[8, 8], [8, 9]],
];

export interface MultiplicationCurriculumLevel {
  level: number;
  title: string;
  newFacts: readonly MultiplicationFactId[];
  emphasis: 'anchors' | 'connected-new' | 'derived-consolidation' | 'spaced-strengthening' | 'mixed-retention';
}

const LEVEL_TITLES = [
  'עוגני 2 ראשונים',
  'עוגני 5 ו־10',
  'משפחת 2 מתרחבת',
  '5 ו־10 כגשרים',
  'משפחת 3 מתחילה',
  '3 מתחברת ל־6 ול־10',
  '4 דרך כפל כפול',
  '4 ו־10 לעובדות מתקדמות',
  'משפחת 6',
  'עוגני 9 ו־10',
  'משפחת 7',
  'משפחת 8',
] as const;

export const MULTIPLICATION_CURRICULUM: readonly MultiplicationCurriculumLevel[] = [
  ...MULTIPLICATION_LEVEL_FACTS.map((facts, index) => ({
    level: index + 1,
    title: LEVEL_TITLES[index],
    newFacts: facts.map(([a, b]) => `${Math.min(a, b)}x${Math.max(a, b)}`),
    emphasis: (index < 2 ? 'anchors' : 'connected-new') as MultiplicationCurriculumLevel['emphasis'],
  })),
  { level: 13, title: 'חיבורי גזירה', newFacts: [], emphasis: 'derived-consolidation' },
  { level: 14, title: 'ביסוס במרווחים', newFacts: [], emphasis: 'spaced-strengthening' },
  { level: 15, title: 'שליפה רחבה ושימור', newFacts: [], emphasis: 'mixed-retention' },
];

export function canonicalFactId(a: number, b: number): MultiplicationFactId {
  const low = Math.min(a, b);
  const high = Math.max(a, b);
  return `${low}x${high}`;
}

function connection(
  kind: MultiplicationConnectionKind,
  sourceA: number,
  sourceB: number,
  operation: MultiplicationConnection['operation'],
  adjustment: number,
): MultiplicationConnection {
  return {
    kind,
    sourceFactId: canonicalFactId(sourceA, sourceB),
    sourceA,
    sourceB,
    sourceAnswer: sourceA * sourceB,
    operation,
    adjustment,
  };
}

function buildConnections(a: number, b: number): MultiplicationConnection[] {
  const out: MultiplicationConnection[] = [];
  if (a !== b) out.push(connection('commutativity', b, a, 'same', 0));

  const factors: [number, number][] = [[a, b], [b, a]];
  for (const [focus, other] of factors) {
    if (focus === 6) out.push(connection('fives', 5, other, 'add', other));
    if (focus === 9) out.push(connection('tens', 10, other, 'subtract', other));
    if (focus % 2 === 0 && focus / 2 >= 2) {
      out.push(connection('double', focus / 2, other, 'double', 0));
    }
  }

  const neighborA = a > 2 ? connection('neighbor', a - 1, b, 'add', b) : null;
  const neighborB = b > 2 ? connection('neighbor', a, b - 1, 'add', a) : null;
  if (neighborA) out.push(neighborA);
  if (neighborB) out.push(neighborB);

  const seen = new Set<string>();
  return out.filter((item) => {
    const key = `${item.kind}:${item.sourceFactId}:${item.operation}:${item.adjustment}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return item.sourceAnswer >= 4 && item.sourceAnswer <= 100;
  });
}

const introducedAt = new Map<string, number>();
MULTIPLICATION_LEVEL_FACTS.forEach((facts, levelIndex) => {
  facts.forEach(([a, b]) => introducedAt.set(canonicalFactId(a, b), levelIndex + 1));
});

export const MULTIPLICATION_FACTS: readonly MultiplicationFact[] = Array.from({ length: 9 }, (_, row) => row + 2)
  .flatMap((a) => Array.from({ length: 11 - a }, (_, column) => a + column).map((b) => ({
    id: canonicalFactId(a, b),
    a,
    b,
    answer: a * b,
    introducedAtLevel: introducedAt.get(canonicalFactId(a, b)) ?? 12,
    connections: buildConnections(a, b),
  })))
  .sort((left, right) => left.introducedAtLevel - right.introducedAtLevel || left.a - right.a || left.b - right.b);

export const MULTIPLICATION_FACT_BY_ID = new Map(MULTIPLICATION_FACTS.map((fact) => [fact.id, fact]));

export function factsAvailableAtLevel(level: number): MultiplicationFact[] {
  const capped = Math.max(1, Math.min(15, Math.round(level)));
  const introductionLevel = Math.min(capped, 12);
  return MULTIPLICATION_FACTS.filter((fact) => fact.introducedAtLevel <= introductionLevel);
}

function stageFor(progress: MultiplicationProgress | undefined, factId: string): MultiplicationStage {
  return progress?.facts[factId]?.stage ?? 'DISCOVERING';
}

function hasEstablishedAnchor(fact: MultiplicationFact, progress: MultiplicationProgress | undefined): boolean {
  return fact.connections.some((item) => {
    if (item.sourceFactId === fact.id) return false;
    const stage = stageFor(progress, item.sourceFactId);
    return stage === 'STRENGTHENING' || stage === 'FLUENT';
  });
}

export interface SelectMultiplicationFactOptions {
  requireConnection?: boolean;
}

/** סדר בחירה: הגיע מועדו → מתחזק → חדש שמחובר לעוגן → חדש → שימור שוטף. */
export function selectMultiplicationFact(
  level: number,
  rng: Rng,
  progress: MultiplicationProgress | undefined,
  now: number,
  options: SelectMultiplicationFactOptions = {},
): MultiplicationFact {
  let candidates = factsAvailableAtLevel(level);
  if (options.requireConnection) {
    candidates = candidates.filter((fact) => fact.connections.some((item) => item.sourceFactId !== fact.id));
  }
  if (candidates.length === 0) candidates = factsAvailableAtLevel(level);

  // ערבוב לפני מיון שומר הכרעה דטרמיניסטית בין עובדות באותה עדיפות.
  const shuffled = rng.shuffle(candidates);
  const priority = (fact: MultiplicationFact): number => {
    const saved = progress?.facts[fact.id];
    if (saved && saved.lastPracticedAt !== null && saved.dueAt <= now) return 0;
    if (saved?.stage === 'STRENGTHENING') return 1;
    if (!saved && hasEstablishedAnchor(fact, progress)) return 2;
    if (!saved || saved.stage === 'DISCOVERING') return 3;
    return 4;
  };
  return shuffled.sort((left, right) => priority(left) - priority(right))[0];
}

export function preferredConnection(
  fact: MultiplicationFact,
  progress?: MultiplicationProgress,
): MultiplicationConnection {
  const withEstablishedAnchor = fact.connections.find((item) => {
    if (item.sourceFactId === fact.id) return false;
    const stage = stageFor(progress, item.sourceFactId);
    return stage === 'STRENGTHENING' || stage === 'FLUENT';
  });
  return withEstablishedAnchor
    ?? fact.connections.find((item) => item.sourceFactId !== fact.id)
    ?? fact.connections[0]
    ?? connection('commutativity', fact.b, fact.a, 'same', 0);
}

export function connectionResult(item: MultiplicationConnection): number {
  if (item.operation === 'double') return item.sourceAnswer * 2;
  if (item.operation === 'add') return item.sourceAnswer + item.adjustment;
  if (item.operation === 'subtract') return item.sourceAnswer - item.adjustment;
  return item.sourceAnswer;
}
