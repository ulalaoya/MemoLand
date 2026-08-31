import { describe, expect, it } from 'vitest';
import { ENGINES, enginesForLand, getEngine } from './index';
import { chainMath, digitForward } from './numbers';
import {
  MAX_LEVEL,
  MIN_LEVEL,
  chainMathConfig,
  digitSpanLength,
  gridConfig,
  memorizeConfig,
  patternLength,
  sentenceComponentCount,
} from '../config/curriculum';
import { connectionsLink } from './connections';
import { factsAvailableAtLevel } from '../learning/multiplicationFacts';
import { speedMatch } from './speed';
import { challengeFingerprint, generateVariedChallenge } from './variety';

/** בדיקת יסוד: כל generator מייצר אתגר פתיר שהתשובה נגזרת מהגירוי,
    ובודק check() נכון לתשובה הנכונה בכל רמה וזרע. */
describe('generators — פתירות ונכונות', () => {
  for (const engine of ENGINES) {
    it(`${engine.id}: התשובה הנכונה תמיד עוברת check`, () => {
      for (let level = MIN_LEVEL; level <= MAX_LEVEL; level++) {
        for (let seed = 1; seed <= 40; seed++) {
          const ch = engine.generate(level, seed);
          expect(ch.exerciseId).toBe(engine.id);
          expect(ch.level).toBe(level);
          // התשובה הנכונה חייבת לעבור
          expect(engine.check(ch, ch.answer as never)).toBe(true);
        }
      }
    });

    it(`${engine.id}: דטרמיניסטי — אותו זרע נותן אותו אתגר`, () => {
      const a = engine.generate(7, 123);
      const b = engine.generate(7, 123);
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    });
  }
});

describe('חשבון בשרשרת — אין תוצאות שליליות ואין שברים', () => {
  it('התוצאה תמיד מספר שלם ואי-שלילי', () => {
    for (let level = MIN_LEVEL; level <= MAX_LEVEL; level++) {
      for (let seed = 1; seed <= 100; seed++) {
        const ch = chainMath.generate(level, seed);
        expect(Number.isInteger(ch.answer)).toBe(true);
        expect(ch.answer as number).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe('מרשם המנועים', () => {
  it('getEngine מחזיר את המנוע לפי מזהה', () => {
    expect(getEngine('numbers.forward')?.id).toBe('numbers.forward');
    expect(getEngine('לא-קיים')).toBeUndefined();
  });

  it('connection-link distractors stay within the introduced curriculum', () => {
    const available = new Set(factsAvailableAtLevel(1).map((fact) => fact.id));
    for (let seed = 1; seed <= 30; seed++) {
      const challenge = connectionsLink.generate(1, seed);
      expect(challenge.stimulus.options).toHaveLength(3);
      expect(new Set(challenge.stimulus.options.map((option) => option.factId)).size).toBe(3);
      expect(challenge.stimulus.options.every((option) => available.has(option.factId))).toBe(true);
    }
  });

  it('תשובה שגויה נכשלת ב-check (רצף קדימה)', () => {
    const eng = getEngine('numbers.forward')!;
    const ch = eng.generate(5, 9);
    const wrong = [...(ch.answer as number[])];
    wrong[0] = ((wrong[0] % 9) + 1); // משנה ספרה אחת
    expect(eng.check(ch, wrong as never)).toBe(false);
  });

  it('keeps inactive engines registered while City child rotation stays direct-only', () => {
    expect(enginesForLand('echoes').map(({ id }) => id)).toEqual(['echoes.repeat']);
    expect(getEngine('echoes.multistep')?.id).toBe('echoes.multistep');
    expect(enginesForLand('numbers').map(({ id }) => id)).toEqual([
      'numbers.forward',
      'numbers.backward',
      'numbers.sort',
      'numbers.chain',
    ]);
    expect(enginesForLand('connections').map(({ id }) => id)).toEqual(['connections.direct']);
    expect(getEngine('connections.derived')?.id).toBe('connections.derived');
    expect(getEngine('connections.link')?.id).toBe('connections.link');
    expect(enginesForLand('forest').map(({ id }) => id)).toEqual(['forest.grid']);
    expect(enginesForLand('patterns').map(({ id }) => id)).toEqual(['patterns.complete']);
    expect(enginesForLand('speed').map(({ id }) => id)).toEqual(['speed.match']);
    expect(enginesForLand('castle').map(({ id }) => id)).toEqual(['castle.memorize']);
  });
});

describe('actual world difficulty progression', () => {
  it('raises memory length/complexity or load in every generated-memory world', () => {
    expect(digitSpanLength(15)).toBeGreaterThan(digitSpanLength(1));
    expect(chainMathConfig(15).steps).toBeGreaterThan(chainMathConfig(1).steps);
    expect(sentenceComponentCount(1)).toBe(3);
    expect(sentenceComponentCount(15)).toBe(6);
    expect(gridConfig(15).cells).toBeGreaterThan(gridConfig(1).cells);
    expect(gridConfig(15).grid).toBeGreaterThan(gridConfig(1).grid);
    expect(gridConfig(15).viewMs).toBeLessThan(gridConfig(1).viewMs);
    expect(patternLength(15)).toBeGreaterThan(patternLength(1));
    expect(speedMatch.generate(15, 7).stimulus.options.length).toBeGreaterThan(
      speedMatch.generate(1, 7).stimulus.options.length,
    );
    expect(memorizeConfig(15).items).toBeGreaterThan(memorizeConfig(1).items);
    expect(memorizeConfig(15).viewMs).toBeLessThan(memorizeConfig(1).viewMs);
  });

  it('uses the shared last-three rule outside Echo as well', () => {
    const first = digitForward.generate(4, 99);
    const varied = generateVariedChallenge(digitForward, 4, 99, [challengeFingerprint(first)]);
    expect(challengeFingerprint(varied)).not.toBe(challengeFingerprint(first));
  });
});
