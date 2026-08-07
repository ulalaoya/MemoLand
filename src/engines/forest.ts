/* =========================================================================
   ארץ 3 — יער התמונות (זיכרון חזותי-מרחבי) · מדריך: הצב
   מנוע: זיכרון מיקום ברשת (Corsi) — נחשפים תאים מוארים, נעלמים, והילד
   משחזר את המיקומים בהקשה. התשובה נגזרת מהגירוי.
   ========================================================================= */
import type { Challenge, ExerciseEngine } from '../types';
import { gridConfig } from '../config/curriculum';
import { makeRng } from './rng';

export interface GridStimulus {
  grid: number; // גודל הרשת (grid x grid)
  cells: number[]; // אינדקסי התאים המוארים
  viewMs: number;
}
export type GridAnswer = number[];

function sameSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
}

export const forestGrid: ExerciseEngine<GridStimulus, GridAnswer> = {
  id: 'forest.grid',
  landId: 'forest',
  title: 'זיכרון מקומות',
  parentDescription: 'זיכרון מרחבי — שחזור מיקומים ברשת (מטלת Corsi)',
  generate(level, seed): Challenge<GridStimulus, GridAnswer> {
    const rng = makeRng(seed);
    const cfg = gridConfig(level);
    const total = cfg.grid * cfg.grid;
    const count = Math.min(cfg.cells, total);
    // בוחרים תאים ייחודיים
    const pool = Array.from({ length: total }, (_, i) => i);
    const cells = rng.shuffle(pool).slice(0, count).sort((a, b) => a - b);
    const stimulus: GridStimulus = { grid: cfg.grid, cells, viewMs: cfg.viewMs };
    return {
      exerciseId: this.id,
      landId: 'forest',
      level,
      stimulus,
      answer: cells,
      params: { grid: cfg.grid, count, viewMs: cfg.viewMs },
      prompt: 'זכור אילו מקומות נדלקו — ואז הקש עליהם',
    };
  },
  check(challenge, given) {
    return sameSet(given, challenge.answer);
  },
};
