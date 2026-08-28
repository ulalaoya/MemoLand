import { describe, expect, it } from 'vitest';
import { coinsForCorrect } from './rewards';

describe('reward policy', () => {
  it('can explicitly suppress raw response-speed rewards for City of Connections', () => {
    expect(coinsForCorrect(0, 500, false)).toBe(coinsForCorrect(0, 8_000, false));
    expect(coinsForCorrect(0, 500, true)).toBeGreaterThan(coinsForCorrect(0, 8_000, true));
  });
});
