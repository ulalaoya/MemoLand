import { describe, expect, it } from 'vitest';
import { makeRng } from '../engines/rng';
import {
  applyMultiplicationAttempts,
  defaultMultiplicationFactProgress,
  defaultMultiplicationProgress,
} from '../state/multiplicationProgress';
import {
  MULTIPLICATION_FACTS,
  MULTIPLICATION_FACT_BY_ID,
  MULTIPLICATION_CURRICULUM,
  MULTIPLICATION_LEVEL_FACTS,
  canonicalFactId,
  connectionResult,
  factsAvailableAtLevel,
  multiplicationCurriculumLevel,
  preferredConnection,
  selectMultiplicationFact,
} from './multiplicationFacts';

function recordDirect(
  progress: ReturnType<typeof defaultMultiplicationProgress>,
  factId: string,
  correct: boolean,
  at: number,
) {
  return applyMultiplicationAttempts(progress, [{
    factId,
    challengeType: 'direct',
    correct,
    responseTimeMs: 800,
    helpLevelUsed: 0,
    mode: 'direct',
    at,
  }]);
}

describe('multiplication fact registry', () => {
  it('contains exactly the canonical 2×2–10×10 fact set', () => {
    expect(MULTIPLICATION_FACTS).toHaveLength(45);
    expect(new Set(MULTIPLICATION_FACTS.map((fact) => fact.id)).size).toBe(45);
    expect(canonicalFactId(7, 3)).toBe('3x7');
    expect(canonicalFactId(3, 7)).toBe('3x7');
    expect(MULTIPLICATION_FACTS.every((fact) => fact.a >= 2 && fact.a <= fact.b && fact.b <= 10)).toBe(true);
  });

  it('introduces all 45 facts once across levels 1–12 and consolidates at 13–15', () => {
    const introduced = MULTIPLICATION_LEVEL_FACTS.flat().map(([a, b]) => canonicalFactId(a, b));
    expect(introduced).toHaveLength(45);
    expect(new Set(introduced).size).toBe(45);
    expect(factsAvailableAtLevel(1)).toHaveLength(4);
    expect(factsAvailableAtLevel(12)).toHaveLength(45);
    expect(factsAvailableAtLevel(15)).toHaveLength(45);
    expect(MULTIPLICATION_CURRICULUM).toHaveLength(15);
    expect(MULTIPLICATION_CURRICULUM.slice(12).map((level) => level.emphasis)).toEqual([
      'derived-consolidation', 'spaced-strengthening', 'mixed-retention',
    ]);
    expect(Array.from({ length: 15 }, (_, index) => factsAvailableAtLevel(index + 1).length)).toEqual([
      4, 8, 12, 17, 21, 25, 29, 33, 37, 40, 43, 45, 45, 45, 45,
    ]);
  });

  it('all modeled connections calculate the target answer', () => {
    for (const fact of MULTIPLICATION_FACTS) {
      for (const link of fact.connections) {
        expect(connectionResult(link)).toBe(fact.answer);
      }
    }
  });

  it('chooses child-friendly default hint paths when no anchor is established', () => {
    const cases = [
      ['2x4', '2x2', 'double'],
      ['6x8', '5x8', 'fives'],
      ['7x8', '7x7', 'neighbor'],
      ['6x9', '6x10', 'tens'],
    ] as const;
    for (const [factId, sourceFactId, kind] of cases) {
      const fact = MULTIPLICATION_FACT_BY_ID.get(factId)!;
      const selected = preferredConnection(fact);
      expect(selected.sourceFactId).toBe(sourceFactId);
      expect(selected.kind).toBe(kind);
      expect(connectionResult(selected)).toBe(fact.answer);
    }
  });

  it('prioritizes a due fact deterministically', () => {
    const progress = defaultMultiplicationProgress();
    progress.facts['2x2'] = {
      ...defaultMultiplicationFactProgress('2x2'),
      stage: 'STRENGTHENING',
      lastPracticedAt: 50,
      dueAt: 100,
    };
    const first = selectMultiplicationFact(8, makeRng(17), progress, 101);
    const second = selectMultiplicationFact(8, makeRng(17), progress, 101);
    expect(first.id).toBe('2x2');
    expect(second.id).toBe(first.id);
  });

  it('does not let a strengthening fact monopolize the current level before it is due', () => {
    const strengthening = defaultMultiplicationProgress();
    strengthening.facts['2x2'] = {
      ...defaultMultiplicationFactProgress('2x2'),
      stage: 'STRENGTHENING',
      directCorrect: 2,
      lastPracticedAt: 50,
      dueAt: 10_000,
    };
    expect(selectMultiplicationFact(1, makeRng(5), strengthening, 100).id).not.toBe('2x2');

    const anchor = defaultMultiplicationProgress();
    anchor.facts['2x2'] = {
      ...defaultMultiplicationFactProgress('2x2'),
      stage: 'FLUENT',
      lastPracticedAt: 50,
      dueAt: 10_000,
    };
    const selected = selectMultiplicationFact(1, makeRng(5), anchor, 100);
    expect(selected.connections.some((link) => link.sourceFactId === '2x2' && link.sourceFactId !== selected.id)).toBe(true);
  });

  it('rotates a fresh level 1 cohort after 2×2 strengthens instead of looping it', () => {
    let progress = defaultMultiplicationProgress();
    progress = recordDirect(progress, '2x2', true, 10);
    progress = recordDirect(progress, '2x2', true, 20);
    expect(progress.facts['2x2'].stage).toBe('STRENGTHENING');

    const selected: string[] = [];
    for (let index = 0; index < 12; index += 1) {
      const fact = selectMultiplicationFact(1, makeRng(200 + index), progress, 100 + index);
      selected.push(fact.id);
      progress = recordDirect(progress, fact.id, true, 100 + index);
    }

    expect(selected[0]).not.toBe('2x2');
    expect(new Set(selected.slice(0, 3))).toEqual(new Set(['2x3', '2x4', '2x5']));
    expect(selected.every((factId, index) => index === 0 || factId !== selected[index - 1])).toBe(true);
  });

  it('returns a missed fact after three other distinct facts when alternatives exist', () => {
    let progress = defaultMultiplicationProgress();
    for (const fact of factsAvailableAtLevel(1)) {
      progress.facts[fact.id] = {
        ...defaultMultiplicationFactProgress(fact.id),
        stage: 'STRENGTHENING',
        directCorrect: 2,
        lastPracticedAt: 10,
        dueAt: 10_000,
      };
    }
    progress = recordDirect(progress, '2x2', false, 20);
    progress = recordDirect(progress, '2x3', true, 30);
    progress = recordDirect(progress, '2x4', true, 40);
    progress = recordDirect(progress, '2x5', true, 50);

    expect(selectMultiplicationFact(1, makeRng(99), progress, 100).id).toBe('2x2');
  });

  it('unlocks new-fact levels only after two direct unassisted successes for every fact', () => {
    const progress = defaultMultiplicationProgress();
    expect(multiplicationCurriculumLevel(progress)).toBe(1);

    for (const [index, factId] of MULTIPLICATION_CURRICULUM[0].newFacts.entries()) {
      progress.facts[factId] = {
        ...defaultMultiplicationFactProgress(factId),
        directCorrect: index === 0 ? 8 : 1,
        stage: index === 0 ? 'FLUENT' : 'DISCOVERING',
      };
    }
    expect(multiplicationCurriculumLevel(progress)).toBe(1);

    for (const factId of MULTIPLICATION_CURRICULUM[0].newFacts) {
      progress.facts[factId] = { ...progress.facts[factId], directCorrect: 2, stage: 'STRENGTHENING' };
    }
    expect(multiplicationCurriculumLevel(progress)).toBe(2);

    for (const factId of MULTIPLICATION_CURRICULUM[1].newFacts) {
      progress.facts[factId] = {
        ...defaultMultiplicationFactProgress(factId),
        supportedCorrect: 20,
        stage: 'STRENGTHENING',
      };
    }
    expect(multiplicationCurriculumLevel(progress)).toBe(2);
  });

  it('preserves all 15 curriculum levels without requiring FLUENT status', () => {
    const progress = defaultMultiplicationProgress();
    for (const fact of MULTIPLICATION_FACTS) {
      progress.facts[fact.id] = {
        ...defaultMultiplicationFactProgress(fact.id),
        directCorrect: 2,
        stage: 'STRENGTHENING',
      };
    }
    expect(multiplicationCurriculumLevel(progress)).toBe(13);
    for (const fact of MULTIPLICATION_FACTS) progress.facts[fact.id].directCorrect = 3;
    expect(multiplicationCurriculumLevel(progress)).toBe(14);
    for (const fact of MULTIPLICATION_FACTS) progress.facts[fact.id].directCorrect = 4;
    expect(multiplicationCurriculumLevel(progress)).toBe(15);
    expect(MULTIPLICATION_CURRICULUM).toHaveLength(15);
  });

  it('falls back to occasional fluent retention when no fact is due or developing', () => {
    const progress = defaultMultiplicationProgress();
    for (const fact of factsAvailableAtLevel(1)) {
      progress.facts[fact.id] = {
        ...defaultMultiplicationFactProgress(fact.id),
        stage: 'FLUENT',
        lastPracticedAt: 50,
        dueAt: 10_000,
      };
    }
    const selected = selectMultiplicationFact(1, makeRng(91), progress, 100);
    expect(progress.facts[selected.id].stage).toBe('FLUENT');
  });
});
