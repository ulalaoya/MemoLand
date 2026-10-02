/* =========================================================================
   ארץ 4 — הרי התבניות (לוגיקה ורצפים) · מדריך: המפלצת הסגולה
   מנוע: השלמת תבנית — רצף צורות/צבעים לפי חוקיות, והילד בוחר מה בא אחר כך.
   ========================================================================= */
import type { Challenge, ExerciseEngine } from '../types';
import { patternLength } from '../config/curriculum';
import { makeRng } from './rng';

export type Shape = 'circle' | 'triangle' | 'square' | 'star';
export interface Token {
  shape: Shape;
  color: string; // ערך CSS
}
export interface PatternStimulus {
  sequence: Token[]; // מה שמוצג
  options: Token[]; // אפשרויות לבחירה
}
export type PatternAnswer = number; // אינדקס האפשרות הנכונה

const SHAPES: Shape[] = ['circle', 'triangle', 'square', 'star'];
const COLORS = ['var(--red)', 'var(--yellow)', 'var(--btn-green)', 'var(--btn-blue)', 'var(--btn-purple)'];

function tokKey(t: Token): string {
  return `${t.shape}|${t.color}`;
}

export const patternComplete: ExerciseEngine<PatternStimulus, PatternAnswer> = {
  id: 'patterns.complete',
  landId: 'patterns',
  title: 'השלם את התבנית',
  parentDescription: 'זיהוי חוקיות והשלמת רצף לוגי',
  generate(level, seed): Challenge<PatternStimulus, PatternAnswer> {
    const rng = makeRng(seed);
    const period = level <= 5 ? 2 : level <= 10 ? 3 : 4;
    const shown = patternLength(level);
    // בונים בסיס של period אסימונים ייחודיים
    const shapes = rng.shuffle(SHAPES).slice(0, period);
    const colors = rng.shuffle(COLORS).slice(0, period);
    const base: Token[] = shapes.map((s, i) => ({ shape: s, color: colors[i] }));
    // הרצף המוצג + האסימון הבא (התשובה)
    const sequence: Token[] = [];
    for (let i = 0; i < shown; i++) sequence.push(base[i % period]);
    const correct = base[shown % period];
    // אפשרויות: הנכון + מסיחים
    const allTokens = SHAPES.flatMap((shape) => COLORS.map((color) => ({ shape, color })));
    const distractPool = rng.shuffle(allTokens.filter((token) => tokKey(token) !== tokKey(correct)));
    const opts: Token[] = [correct];
    const used = new Set([tokKey(correct)]);
    for (const candidate of distractPool) {
      if (used.has(tokKey(candidate))) continue;
      opts.push(candidate);
      used.add(tokKey(candidate));
      if (opts.length === 3) break;
    }
    const options = rng.shuffle(opts);
    const answer = options.findIndex((t) => tokKey(t) === tokKey(correct));
    return {
      exerciseId: this.id,
      landId: 'patterns',
      level,
      stimulus: { sequence, options },
      answer,
      params: { period, shown },
      prompt: 'מה בא אחר כך בתבנית?',
    };
  },
  check(challenge, given) {
    return given === challenge.answer;
  },
};
