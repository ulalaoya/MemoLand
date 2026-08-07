import { describe, expect, it } from 'vitest';
import { ENGINES, getEngine } from './index';
import { chainMath } from './numbers';
import { MAX_LEVEL, MIN_LEVEL } from '../config/curriculum';

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

  it('תשובה שגויה נכשלת ב-check (רצף קדימה)', () => {
    const eng = getEngine('numbers.forward')!;
    const ch = eng.generate(5, 9);
    const wrong = [...(ch.answer as number[])];
    wrong[0] = ((wrong[0] % 9) + 1); // משנה ספרה אחת
    expect(eng.check(ch, wrong as never)).toBe(false);
  });
});
