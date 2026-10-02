import { describe, expect, it } from 'vitest';
import { MAX_LEVEL, MIN_LEVEL, sentenceComponentCount } from '../config/curriculum';
import { listenRepeat } from './echoes';
import { LISTEN_REPEAT_BETA_SENTENCES } from './echoesContent';
import { challengeFingerprint, generateVariedChallenge } from './variety';

describe('Echo ListenRepeat curated beta content', () => {
  it('contains the 12 recorded full utterances split into one-word tiles', () => {
    expect(LISTEN_REPEAT_BETA_SENTENCES).toHaveLength(12);
    for (const { text, tiles } of LISTEN_REPEAT_BETA_SENTENCES) {
      expect(tiles.join(' ')).toBe(text);
      expect(tiles.every((word) => !word.includes(' '))).toBe(true);
    }
  });

  it('contains three recorded alternatives in each 3/4/5/6 difficulty tier', () => {
    expect(
      [3, 4, 5, 6].map((difficulty) => LISTEN_REPEAT_BETA_SENTENCES.filter((sentence) => sentence.difficulty === difficulty).length),
    ).toEqual([3, 3, 3, 3]);
    for (const { text, tiles } of LISTEN_REPEAT_BETA_SENTENCES) expect(tiles.join(' ')).toBe(text);
  });

  it('generates only bank sentences at the component count assigned to the level', () => {
    const bankTexts = new Set(LISTEN_REPEAT_BETA_SENTENCES.map(({ text }) => text));
    for (let level = MIN_LEVEL; level <= MAX_LEVEL; level += 1) {
      for (let seed = 1; seed <= 100; seed += 1) {
        const challenge = listenRepeat.generate(level, seed);
        expect(challenge.prompt).toBeDefined();
        expect(bankTexts.has(challenge.prompt!)).toBe(true);
        expect(
          LISTEN_REPEAT_BETA_SENTENCES.find(({ text }) => text === challenge.prompt)?.difficulty,
        ).toBe(sentenceComponentCount(level));
        expect(challenge.stimulus.words.join(' ')).toBe(challenge.prompt);
      }
    }
  });

  it('remains deterministic for the same level and seed', () => {
    for (let level = MIN_LEVEL; level <= MAX_LEVEL; level += 1) {
      expect(listenRepeat.generate(level, 8472)).toEqual(listenRepeat.generate(level, 8472));
    }
  });

  it('cycles every alternative in a tier before the least-recent sentence repeats', () => {
    const recent: string[] = [];
    const seen: string[] = [];
    for (let round = 0; round < 4; round += 1) {
      const challenge = generateVariedChallenge(listenRepeat, 1, 120, recent);
      const fingerprint = challengeFingerprint(challenge);
      seen.push(fingerprint);
      recent.push(fingerprint);
      if (recent.length > 3) recent.shift();
    }
    expect(new Set(seen).size).toBe(3);
  });
});
