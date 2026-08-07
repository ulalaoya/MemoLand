/* =========================================================================
   ארץ 1 — עמק המספרים (זיכרון עבודה) · מדריך: ממו
   מנועים: רצף קדימה, רצף הפוך, מיון רצף, חשבון בשרשרת.
   כל מנוע טהור: (level, seed) => Challenge. התשובה תמיד נגזרת מהגירוי.
   ========================================================================= */
import type { Challenge, ExerciseEngine } from '../types';
import { chainMathConfig, digitFlashMs, digitSpanLength } from '../config/curriculum';
import { makeRng } from './rng';

/* ---- גירוי משותף לתרגילי רצף ספרות ---- */
export interface DigitSpanStimulus {
  digits: number[]; // הספרות בסדר ההצגה
  flashMs: number; // זמן חשיפת כל ספרה
  mode: 'forward' | 'backward' | 'sort';
}
export type DigitSpanAnswer = number[]; // סדר הספרות שהוקלד

function generateDigits(level: number, seed: number, mode: DigitSpanStimulus['mode']) {
  const rng = makeRng(seed);
  const len = digitSpanLength(level);
  const digits: number[] = [];
  for (let i = 0; i < len; i++) digits.push(rng.int(1, 9));
  return { digits, flashMs: digitFlashMs(level), mode };
}

function expectedAnswer(stim: DigitSpanStimulus): number[] {
  switch (stim.mode) {
    case 'forward':
      return [...stim.digits];
    case 'backward':
      return [...stim.digits].reverse();
    case 'sort':
      return [...stim.digits].sort((a, b) => a - b);
  }
}

function makeDigitEngine(
  id: string,
  title: string,
  parentDescription: string,
  mode: DigitSpanStimulus['mode'],
): ExerciseEngine<DigitSpanStimulus, DigitSpanAnswer> {
  return {
    id,
    landId: 'numbers',
    title,
    parentDescription,
    generate(level, seed): Challenge<DigitSpanStimulus, DigitSpanAnswer> {
      const stimulus = generateDigits(level, seed, mode);
      return {
        exerciseId: id,
        landId: 'numbers',
        level,
        stimulus,
        answer: expectedAnswer(stimulus),
        params: { length: stimulus.digits.length, flashMs: stimulus.flashMs },
        prompt:
          mode === 'forward'
            ? 'הקשב וזכור את הספרות לפי הסדר'
            : mode === 'backward'
              ? 'זכור את הספרות — ותקליד אותן מהסוף להתחלה'
              : 'זכור את הספרות — ותסדר אותן מהקטן לגדול',
      };
    },
    check(challenge, given) {
      const exp = challenge.answer;
      return given.length === exp.length && given.every((d, i) => d === exp[i]);
    },
  };
}

export const digitForward = makeDigitEngine(
  'numbers.forward',
  'רצף הספרות',
  'רצף ספרות קדימה — טווח זיכרון עבודה מילולי',
  'forward',
);

export const digitBackward = makeDigitEngine(
  'numbers.backward',
  'הרצף ההפוך',
  'רצף ספרות הפוך — מניפולציה בזיכרון עבודה',
  'backward',
);

export const digitSort = makeDigitEngine(
  'numbers.sort',
  'מיון הספרות',
  'מיון רצף מהקטן לגדול — עדכון בזיכרון עבודה',
  'sort',
);

/* ---- חשבון בשרשרת ---- */
export interface ChainMathStimulus {
  start: number;
  steps: { op: '+' | '-' | '×'; value: number }[];
  revealMs: number;
}
export type ChainMathAnswer = number;

function chainResult(stim: ChainMathStimulus): number {
  let acc = stim.start;
  for (const s of stim.steps) {
    if (s.op === '+') acc += s.value;
    else if (s.op === '-') acc -= s.value;
    else acc *= s.value;
  }
  return acc;
}

export const chainMath: ExerciseEngine<ChainMathStimulus, ChainMathAnswer> = {
  id: 'numbers.chain',
  landId: 'numbers',
  title: 'חשבון בראש',
  parentDescription: 'חשבון בשרשרת — עדכון רציף בזיכרון עבודה',
  generate(level, seed): Challenge<ChainMathStimulus, ChainMathAnswer> {
    const rng = makeRng(seed);
    const cfg = chainMathConfig(level);
    const start = rng.int(10, cfg.maxStart);
    const steps: ChainMathStimulus['steps'] = [];
    let acc = start;
    for (let i = 0; i < cfg.steps; i++) {
      // בוחרים פעולה כך שהתוצאה נשארת חיובית וסבירה (ללא שברים).
      const canMul = level >= 6 && acc <= 30 && i > 0;
      const op = canMul && rng.next() < 0.25 ? '×' : rng.next() < 0.5 ? '+' : '-';
      let value: number;
      if (op === '×') {
        value = 2;
      } else if (op === '-') {
        value = rng.int(1, Math.min(cfg.maxDelta, acc - 1)); // לא יורד מתחת ל-1
      } else {
        value = rng.int(1, cfg.maxDelta);
      }
      steps.push({ op, value });
      acc = op === '+' ? acc + value : op === '-' ? acc - value : acc * value;
    }
    const stimulus: ChainMathStimulus = { start, steps, revealMs: cfg.revealMs };
    return {
      exerciseId: this.id,
      landId: 'numbers',
      level,
      stimulus,
      answer: chainResult(stimulus),
      params: { steps: steps.length, revealMs: cfg.revealMs },
      prompt: 'עקוב אחרי החשבון בראש — כל שלב נעלם',
    };
  },
  check(challenge, given) {
    return given === challenge.answer;
  },
};
