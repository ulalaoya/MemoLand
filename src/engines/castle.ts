/* =========================================================================
   ארץ 6 — טירת האוצר (שינון וקידוד) · מדריך: ממו
   מנוע: שינון רשימה — נחשפת רשימת פריטים לזמן מוגבל, נעלמת, והילד משחזר
   את הסדר מאריחים מעורבבים.
   ========================================================================= */
import type { Challenge, ExerciseEngine } from '../types';
import { memorizeConfig } from '../config/curriculum';
import { makeRng } from './rng';

/** בנק פריטים לשינון (עברית פשוטה). */
const ITEMS = [
  'תפוח', 'כלב', 'שולחן', 'ירח', 'ספר', 'פרח', 'כדור', 'עוגה',
  'דג', 'כובע', 'עץ', 'מפתח', 'כוכב', 'גשר', 'ענן', 'תוף',
  'נעל', 'מטרייה', 'בלון', 'פנס',
];

export interface MemorizeStimulus {
  items: string[]; // הרשימה לשינון (בסדר)
  scrambled: string[]; // אריחים מעורבבים
  viewMs: number;
}
export type MemorizeAnswer = string[];

export const castleMemorize: ExerciseEngine<MemorizeStimulus, MemorizeAnswer> = {
  id: 'castle.memorize',
  landId: 'castle',
  title: 'שינון אוצר',
  parentDescription: 'שינון וקידוד — זכירת רשימה ושחזור הסדר',
  generate(level, seed): Challenge<MemorizeStimulus, MemorizeAnswer> {
    const rng = makeRng(seed);
    const cfg = memorizeConfig(level);
    const items = rng.shuffle(ITEMS).slice(0, cfg.items);
    const scrambled = rng.shuffle(items);
    return {
      exerciseId: this.id,
      landId: 'castle',
      level,
      stimulus: { items, scrambled, viewMs: cfg.viewMs },
      answer: [...items],
      params: { count: items.length, viewMs: cfg.viewMs },
      prompt: 'זכור את האוצרות לפי הסדר',
    };
  },
  check(challenge, given) {
    const exp = challenge.answer;
    return given.length === exp.length && given.every((w, i) => w === exp[i]);
  },
};
