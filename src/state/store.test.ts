import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultSave } from './persistence';
import { CITY_GROWTH_MILESTONE_LIMIT } from './cityGrowth';

let store: typeof import('./store');

beforeAll(async () => {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
  store = await import('./store');
});

beforeEach(() => {
  store.replaceState(defaultSave());
});

function recordCity(correct: boolean, helpLevelUsed = 0) {
  return store.recordAttempt({
    exerciseId: 'connections.direct',
    landId: 'connections',
    correct,
    rtMs: 900,
    multiplicationAttempts: [{
      factId: '2x2',
      challengeType: 'direct',
      correct,
      responseTimeMs: 900,
      helpLevelUsed,
      mode: helpLevelUsed > 0 ? 'derived' : 'direct',
      at: 100,
    }],
  });
}

describe('persistent City visual growth', () => {
  it('starts at zero and grows cumulatively once per completed correct City question', () => {
    expect(store.getState().cityGrowthMilestones).toBe(0);
    recordCity(true);
    expect(store.getState().cityGrowthMilestones).toBe(1);
    recordCity(true);
    expect(store.getState().cityGrowthMilestones).toBe(2);
  });

  it('does not grow on a wrong answer and grows once for a supported correct answer', () => {
    recordCity(false);
    expect(store.getState().cityGrowthMilestones).toBe(0);
    recordCity(true, 1);
    expect(store.getState().cityGrowthMilestones).toBe(1);
  });

  it('never grows from other lands and caps at the 30-step model', () => {
    store.replaceState({ ...defaultSave(), cityGrowthMilestones: CITY_GROWTH_MILESTONE_LIMIT });
    recordCity(true);
    expect(store.getState().cityGrowthMilestones).toBe(CITY_GROWTH_MILESTONE_LIMIT);
    store.recordAttempt({ exerciseId: 'numbers.forward', landId: 'numbers', correct: true, rtMs: 900 });
    expect(store.getState().cityGrowthMilestones).toBe(CITY_GROWTH_MILESTONE_LIMIT);
  });

  it('awards the calculated coins exactly once per correct result', () => {
    const before = store.getState().coins;
    const result = recordCity(true);
    expect(store.getState().coins).toBe(before + result.coinsGained);
  });
});
