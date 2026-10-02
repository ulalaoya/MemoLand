import { describe, expect, it } from 'vitest';
import { patternComplete } from './patterns';

describe('pattern choices', () => {
  it('always creates three distinct choices with exactly one correct answer', () => {
    for (let level = 1; level <= 15; level += 1) {
      for (let seed = 0; seed < 120; seed += 1) {
        const challenge = patternComplete.generate(level, seed);
        const keys = challenge.stimulus.options.map(({ shape, color }) => `${shape}|${color}`);
        expect(new Set(keys).size).toBe(3);
        const correctKey = keys[challenge.answer];
        expect(keys.filter((key) => key === correctKey)).toHaveLength(1);
      }
    }
  });
});
