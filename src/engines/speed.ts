/* =========================================================================
   ארץ 5 — מסלול הזריזות (מהירות עיבוד) · מדריך: הפטרייה
   מנוע: התאמת סמלים מהירה — מוצג סמל מטרה ו-3 אפשרויות, בוחרים את הזהה.
   (אתגר המהירות עם הטיימר בסשן היומי משתמש ב-SpeedMatchGame הנפרד.)
   ========================================================================= */
import type { Challenge, ExerciseEngine } from '../types';
import { TAP_ICONS } from './echoesContent';
import { makeRng } from './rng';

export interface SpeedStimulus {
  target: string; // מזהה אייקון
  options: string[]; // מזהי אייקונים
}
export type SpeedAnswer = number; // אינדקס האפשרות הזהה

export const speedMatch: ExerciseEngine<SpeedStimulus, SpeedAnswer> = {
  id: 'speed.match',
  landId: 'speed',
  title: 'התאמה מהירה',
  parentDescription: 'מהירות עיבוד — התאמת סמלים תחת לחץ זמן',
  generate(level, seed): Challenge<SpeedStimulus, SpeedAnswer> {
    const rng = makeRng(seed);
    // יותר אפשרויות ברמות גבוהות (3→5) להגברת העומס
    const optionCount = level <= 5 ? 3 : level <= 10 ? 4 : 5;
    const shuffled = rng.shuffle(TAP_ICONS);
    const target = shuffled[0].id;
    const distractors = shuffled.slice(1, optionCount).map((i) => i.id);
    const options = rng.shuffle([target, ...distractors]);
    return {
      exerciseId: this.id,
      landId: 'speed',
      level,
      stimulus: { target, options },
      answer: options.indexOf(target),
      params: { optionCount },
      prompt: 'מצא מהר את הסמל הזהה!',
    };
  },
  check(challenge, given) {
    return given === challenge.answer;
  },
};
