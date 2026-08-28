import { describe, expect, it } from 'vitest';
import { makeRng } from '../engines/rng';
import { defaultMultiplicationFactProgress, defaultMultiplicationProgress } from '../state/multiplicationProgress';
import {
  MULTIPLICATION_FACTS,
  MULTIPLICATION_CURRICULUM,
  MULTIPLICATION_LEVEL_FACTS,
  canonicalFactId,
  connectionResult,
  factsAvailableAtLevel,
  selectMultiplicationFact,
} from './multiplicationFacts';

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

  it('prioritizes strengthening, then a new fact connected to an established anchor', () => {
    const strengthening = defaultMultiplicationProgress();
    strengthening.facts['2x2'] = {
      ...defaultMultiplicationFactProgress('2x2'),
      stage: 'STRENGTHENING',
      lastPracticedAt: 50,
      dueAt: 10_000,
    };
    expect(selectMultiplicationFact(1, makeRng(5), strengthening, 100).id).toBe('2x2');

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
