import { describe, expect, it } from 'vitest';
import { MAX_LEVEL, MIN_LEVEL, sentenceComponentCount } from '../config/curriculum';
import { listenRepeat } from './echoes';
import { EXTRAS, OBJECTS, SUBJECTS, VERBS } from './echoesContent';

const masculineVerbs = new Set(VERBS.map(({ masculine }) => masculine));
const feminineVerbs = new Set(VERBS.map(({ feminine }) => feminine));
const subjectGenders = new Map(SUBJECTS.map(({ text, gender }) => [text, gender] as const));

function generatedChallenges() {
  return Array.from({ length: MAX_LEVEL - MIN_LEVEL + 1 }, (_, levelIndex) => MIN_LEVEL + levelIndex).flatMap(
    (level) => Array.from({ length: 100 }, (_, seedIndex) => listenRepeat.generate(level, seedIndex + 1)),
  );
}

describe('Echo listen-and-repeat Hebrew content', () => {
  const challenges = generatedChallenges();

  it('always matches masculine subjects with masculine verb forms', () => {
    const masculineChallenges = challenges.filter(({ stimulus }) => subjectGenders.get(stimulus.words[0]) === 'masculine');
    expect(masculineChallenges.length).toBeGreaterThan(0);
    for (const { stimulus } of masculineChallenges) {
      expect(masculineVerbs.has(stimulus.words[1])).toBe(true);
      expect(feminineVerbs.has(stimulus.words[1])).toBe(false);
    }
  });

  it('always matches feminine subjects with feminine verb forms', () => {
    const feminineChallenges = challenges.filter(({ stimulus }) => subjectGenders.get(stimulus.words[0]) === 'feminine');
    expect(feminineChallenges.length).toBeGreaterThan(0);
    for (const { stimulus } of feminineChallenges) {
      expect(feminineVerbs.has(stimulus.words[1])).toBe(true);
      expect(masculineVerbs.has(stimulus.words[1])).toBe(false);
    }
  });

  it('never repeats an extra or combines morning with evening', () => {
    for (const { stimulus } of challenges) {
      const extras = stimulus.words.slice(3);
      expect(new Set(extras).size).toBe(extras.length);
      expect(extras.includes('בבוקר') && extras.includes('בערב')).toBe(false);
    }
  });

  it('keeps generated component counts on the approved 3-to-8 progression', () => {
    expect(sentenceComponentCount(MIN_LEVEL)).toBe(3);
    expect(sentenceComponentCount(MAX_LEVEL)).toBe(8);
    for (const { level, stimulus } of challenges) {
      expect(stimulus.words).toHaveLength(sentenceComponentCount(level));
    }
  });

  it('remains deterministic for the same level and seed', () => {
    for (let level = MIN_LEVEL; level <= MAX_LEVEL; level += 1) {
      expect(listenRepeat.generate(level, 8472)).toEqual(listenRepeat.generate(level, 8472));
    }
  });

  it('keeps every multiword object phrase as one recall component', () => {
    for (const { stimulus } of challenges) {
      expect(OBJECTS).toContain(stimulus.words[2]);
      expect(stimulus.words[2].split(' ').length).toBeGreaterThan(1);
    }
  });

  it('keeps the approved six-item extra bank unchanged', () => {
    expect(EXTRAS).toEqual(['בגינה', 'בבוקר', 'ליד הים', 'בשמחה', 'מתחת לעץ', 'בערב']);
  });
});
