import { describe, expect, it } from 'vitest';
import { ENGINES, enginesForLand, getEngine } from './index';
import { chainMath } from './numbers';
import { MAX_LEVEL, MIN_LEVEL } from '../config/curriculum';
import { connectionsLink } from './connections';
import { factsAvailableAtLevel } from '../learning/multiplicationFacts';

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
