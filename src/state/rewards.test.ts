import { describe, expect, it } from 'vitest';
import { coinsForCorrect, learningLevelProgress } from './rewards';
import { initialStats } from '../scheduler/leveling';

describe('reward policy', () => {
  it('can explicitly suppress raw response-speed rewards for City of Connections', () => {
    expect(coinsForCorrect(0, 500, false)).toBe(coinsForCorrect(0, 8_000, false));
    expect(coinsForCorrect(0, 500, true)).toBeGreaterThan(coinsForCorrect(0, 8_000, true));
  });
});

describe('learning level progress', () => {
  it('starts at level one and advances slowly from weighted successful practice', () => {
    expect(learningLevelProgress({})).toEqual({ level: 1, ratio: 0, points: 0, next: 90 });
    const early = learningLevelProgress({
      'numbers.forward': { ...initialStats(), attempts: 80, correct: 72, level: 1, peakLevel: 1 },
    });
    expect(early.level).toBe(1);
    expect(early.ratio).toBeGreaterThan(.7);

    const advanced = learningLevelProgress({
      'numbers.forward': { ...initialStats(), attempts: 80, correct: 72, level: 10, peakLevel: 10 },
    });
    expect(advanced.points).toBeGreaterThan(early.points);
    expect(advanced.level).toBeGreaterThan(early.level);
  });
});
