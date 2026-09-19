import { describe, expect, it } from 'vitest';
import type { MultiplicationAttemptInput } from '../types';
import {
  applyMultiplicationAttempts,
  defaultMultiplicationProgress,
  normalizeMultiplicationProgress,
} from './multiplicationProgress';
import { isMultiplicationFactMastered } from '../learning/multiplicationFacts';

function direct(at: number, correct = true): MultiplicationAttemptInput {
  return {
    factId: '7x8',
    challengeType: 'direct',
    correct,
    responseTimeMs: 3200,
    helpLevelUsed: 0,
    mode: 'direct',
    at,
  };
}

describe('multiplication fact progress', () => {
  it('separates direct retrieval from supported success', () => {
    const next = applyMultiplicationAttempts(defaultMultiplicationProgress(), [{
      ...direct(Date.UTC(2026, 7, 20)),
      challengeType: 'direct',
      helpLevelUsed: 2,
      mode: 'derived',
    }]);
    expect(next.facts['7x8'].directAttempts).toBe(0);
    expect(next.facts['7x8'].supportedCorrect).toBe(1);
    expect(next.facts['7x8'].helpUses).toBe(1);
    expect(next.facts['7x8'].lastAnchorFactId).toBeNull();
  });

  it('requires stable direct retrieval across separate days for FLUENT', () => {
    const day1 = Date.UTC(2026, 7, 20);
    const day2 = Date.UTC(2026, 7, 22);
    let progress = defaultMultiplicationProgress();
    progress = applyMultiplicationAttempts(progress, [direct(day1), direct(day1 + 1000), direct(day1 + 2000)]);
    expect(progress.facts['7x8'].stage).toBe('STRENGTHENING');
    progress = applyMultiplicationAttempts(progress, [direct(day2), direct(day2 + 1000), direct(day2 + 2000)]);
    expect(progress.facts['7x8'].stage).toBe('FLUENT');
    expect(progress.facts['7x8'].successfulDays).toHaveLength(2);
  });

  it('never erases a fluent state after an incorrect attempt', () => {
    const day1 = Date.UTC(2026, 7, 20);
    const day2 = Date.UTC(2026, 7, 22);
    let progress = applyMultiplicationAttempts(defaultMultiplicationProgress(), [
      direct(day1), direct(day1 + 1), direct(day1 + 2),
      direct(day2), direct(day2 + 1), direct(day2 + 2),
    ]);
    progress = applyMultiplicationAttempts(progress, [direct(day2 + 3000, false)]);
    expect(progress.facts['7x8'].stage).toBe('FLUENT');
    expect(progress.facts['7x8'].dueAt).toBeGreaterThan(day2 + 3000);
  });

  it('retires a fact after five consecutive unassisted correct answers, even across reversed display order', () => {
    const start = Date.UTC(2026, 8, 19);
    let progress = defaultMultiplicationProgress();
    for (let index = 0; index < 4; index += 1) {
      progress = applyMultiplicationAttempts(progress, [direct(start + index)]);
    }
    expect(isMultiplicationFactMastered(progress, '7x8')).toBe(false);
    progress = applyMultiplicationAttempts(progress, [direct(start + 4)]);
    expect(progress.facts['7x8'].masteredAt).toBe(start + 4);
    expect(isMultiplicationFactMastered(progress, '7x8')).toBe(true);
    progress = applyMultiplicationAttempts(progress, [direct(start + 5, false)]);
    expect(progress.facts['7x8'].consecutiveDirectCorrect).toBe(0);
    expect(progress.facts['7x8'].masteredAt).toBe(start + 4);
  });

  it('resets the mission streak after a mistake or a hinted answer', () => {
    const start = Date.UTC(2026, 8, 19);
    let progress = applyMultiplicationAttempts(defaultMultiplicationProgress(), [
      direct(start), direct(start + 1), direct(start + 2, false),
      direct(start + 3), { ...direct(start + 4), mode: 'derived', helpLevelUsed: 1 },
      direct(start + 5), direct(start + 6), direct(start + 7), direct(start + 8),
    ]);
    expect(progress.facts['7x8'].consecutiveDirectCorrect).toBe(4);
    expect(progress.facts['7x8'].masteredAt).toBeNull();
    progress = applyMultiplicationAttempts(progress, [direct(start + 9)]);
    expect(progress.facts['7x8'].masteredAt).toBe(start + 9);
  });

  it('completes a fact with 1 after its first correct answer, including with help', () => {
    const start = Date.UTC(2026, 8, 19);
    let progress = applyMultiplicationAttempts(defaultMultiplicationProgress(), [
      { ...direct(start, false), factId: '1x7' },
    ]);
    expect(isMultiplicationFactMastered(progress, '1x7')).toBe(false);
    progress = applyMultiplicationAttempts(progress, [
      { ...direct(start + 1), factId: '1x7' },
      { ...direct(start + 2), factId: '1x8', mode: 'derived', helpLevelUsed: 1 },
    ]);
    expect(progress.facts['1x7'].masteredAt).toBe(start + 1);
    expect(progress.facts['1x8'].masteredAt).toBe(start + 2);
    expect(isMultiplicationFactMastered(progress, '1x7')).toBe(true);
    expect(isMultiplicationFactMastered(progress, '1x8')).toBe(true);
  });

  it('recognizes a qualifying streak in old saves without dropping saved data', () => {
    const raw = {
      facts: {
        '7x8': { directCorrect: 6, consecutiveDirectCorrect: 5, lastPracticedAt: 1234, helpUses: 2 },
      },
      recentAttempts: [],
    };
    const restored = normalizeMultiplicationProgress(raw);
    expect(restored.facts['7x8'].masteredAt).toBe(1234);
    expect(restored.facts['7x8'].directCorrect).toBe(6);
    expect(restored.facts['7x8'].helpUses).toBe(2);
  });

  it('recognizes a single correct one-fact from a saved profile', () => {
    const restored = normalizeMultiplicationProgress({
      facts: { '1x9': { supportedCorrect: 1, lastPracticedAt: 5678 } },
      recentAttempts: [],
    });
    expect(restored.facts['1x9'].masteredAt).toBe(5678);
    expect(isMultiplicationFactMastered(restored, '1x9')).toBe(true);
  });
});
