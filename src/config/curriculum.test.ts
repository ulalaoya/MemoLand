import { describe, expect, it } from 'vitest';
import {
  chainMathConfig,
  digitFlashMs,
  digitSpanLength,
  gridConfig,
  MAX_LEVEL,
  memorizeConfig,
  MIN_LEVEL,
  multiStepCount,
  patternLength,
  sentenceComponentCount,
} from './curriculum';

const levels = Array.from({ length: MAX_LEVEL - MIN_LEVEL + 1 }, (_, index) => MIN_LEVEL + index);

describe('curriculum progression', () => {
  it('uses the curated-beta 3/4/5/6 ListenRepeat component tiers', () => {
    expect(levels.map(sentenceComponentCount)).toEqual([3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6]);
  });

  it('leaves every other curriculum progression unchanged', () => {
    expect(levels.map(digitSpanLength)).toEqual([3, 3, 4, 4, 5, 5, 6, 6, 6, 7, 7, 8, 8, 9, 9]);
    expect(levels.map(digitFlashMs)).toEqual([
      1000, 989, 979, 968, 957, 946, 936, 925, 914, 904, 893, 882, 871, 861, 850,
    ]);
    expect(levels.map((level) => chainMathConfig(level).steps)).toEqual([2, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6]);
    expect(levels.map((level) => chainMathConfig(level).maxStart)).toEqual([
      20, 23, 26, 29, 31, 34, 37, 40, 43, 46, 49, 51, 54, 57, 60,
    ]);
    expect(levels.map((level) => chainMathConfig(level).maxDelta)).toEqual([
      9, 10, 11, 11, 12, 13, 14, 15, 15, 16, 17, 18, 18, 19, 20,
    ]);
    expect(levels.map((level) => chainMathConfig(level).revealMs)).toEqual([
      3200, 3129, 3057, 2986, 2914, 2843, 2771, 2700, 2629, 2557, 2486, 2414, 2343, 2271, 2200,
    ]);
    expect(levels.map(multiStepCount)).toEqual([2, 2, 3, 3, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7]);
    expect(levels.map((level) => gridConfig(level).cells)).toEqual([2, 2, 3, 3, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7]);
    expect(levels.map((level) => gridConfig(level).grid)).toEqual([3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5]);
    expect(levels.map((level) => gridConfig(level).viewMs)).toEqual([
      3000, 2893, 2786, 2679, 2571, 2464, 2357, 2250, 2143, 2036, 1929, 1821, 1714, 1607, 1500,
    ]);
    expect(levels.map(patternLength)).toEqual([3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6, 7, 7]);
    expect(levels.map((level) => memorizeConfig(level).items)).toEqual([3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6, 7, 7]);
    expect(levels.map((level) => memorizeConfig(level).viewMs)).toEqual([
      4000, 3857, 3714, 3571, 3429, 3286, 3143, 3000, 2857, 2714, 2571, 2429, 2286, 2143, 2000,
    ]);
  });
});
