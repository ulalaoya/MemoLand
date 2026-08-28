import { describe, expect, it } from 'vitest';
import type { MultiplicationAttemptInput } from '../types';
import { applyMultiplicationAttempts, defaultMultiplicationProgress } from './multiplicationProgress';

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
});
