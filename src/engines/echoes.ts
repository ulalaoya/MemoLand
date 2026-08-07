/* =========================================================================
   ארץ 2 — מערת ההדים (זיכרון שמיעתי) · מדריך: טיפת המים
   מנועים: הקשב וחזור (הרכבת משפט מאריחים), הוראות מרובות שלבים (הקשה בסדר),
   סיפור מוקרא (נשלף בשלב 6). אין זיהוי דיבור — הכל בבחירה/סידור על המסך.
   ========================================================================= */
import type { Challenge, ExerciseEngine } from '../types';
import { multiStepCount, sentenceWordCount } from '../config/curriculum';
import { makeRng } from './rng';
import { EXTRAS, OBJECTS, STORIES, SUBJECTS, TAP_ICONS, VERBS } from './echoesContent';

/* ---- הקשב וחזור ---- */
export interface ListenRepeatStimulus {
  words: string[]; // המשפט הנכון, מילה-מילה
  scrambled: string[]; // אריחים מעורבבים לבחירה
}
export type ListenRepeatAnswer = string[];

export const listenRepeat: ExerciseEngine<ListenRepeatStimulus, ListenRepeatAnswer> = {
  id: 'echoes.repeat',
  landId: 'echoes',
  title: 'הקשב וחזור',
  parentDescription: 'הקשבה וחזרה על משפט — זיכרון שמיעתי מילולי',
  generate(level, seed): Challenge<ListenRepeatStimulus, ListenRepeatAnswer> {
    const rng = makeRng(seed);
    const target = sentenceWordCount(level);
    const words: string[] = [rng.pick(SUBJECTS), rng.pick(VERBS), rng.pick(OBJECTS)];
    // מרחיבים לפי הרמה בעזרת תיאורים; שומרים משפט קריא.
    while (words.length < target) words.push(rng.pick(EXTRAS));
    const scrambled = rng.shuffle(words);
    return {
      exerciseId: this.id,
      landId: 'echoes',
      level,
      stimulus: { words, scrambled },
      answer: [...words],
      params: { length: words.length },
      prompt: words.join(' '),
    };
  },
  check(challenge, given) {
    const exp = challenge.answer;
    return given.length === exp.length && given.every((w, i) => w === exp[i]);
  },
};

/* ---- הוראות מרובות שלבים (על המסך) ---- */
export interface MultiStepStimulus {
  sequence: string[]; // מזהי אייקונים בסדר הנכון
  board: { id: string; label: string }[]; // כל האייקונים על הלוח
}
export type MultiStepAnswer = string[];

export const multiStep: ExerciseEngine<MultiStepStimulus, MultiStepAnswer> = {
  id: 'echoes.multistep',
  landId: 'echoes',
  title: 'עשה לפי הסדר',
  parentDescription: 'ביצוע הוראות מרובות שלבים לפי סדר — זיכרון שמיעתי-מוטורי',
  generate(level, seed): Challenge<MultiStepStimulus, MultiStepAnswer> {
    const rng = makeRng(seed);
    const count = multiStepCount(level);
    // לוח של 6 אייקונים; הרצף בוחר מהם (עם אפשרות לחזרה בבחירה).
    const board = rng.shuffle(TAP_ICONS).slice(0, 6);
    const sequence: string[] = [];
    for (let i = 0; i < count; i++) sequence.push(rng.pick(board).id);
    return {
      exerciseId: this.id,
      landId: 'echoes',
      level,
      stimulus: { sequence, board },
      answer: [...sequence],
      params: { steps: sequence.length },
      prompt: buildInstructionText(sequence, board),
    };
  },
  check(challenge, given) {
    const exp = challenge.answer;
    return given.length === exp.length && given.every((id, i) => id === exp[i]);
  },
};

function buildInstructionText(sequence: string[], board: { id: string; label: string }[]): string {
  const label = (id: string) => board.find((b) => b.id === id)?.label ?? id;
  const parts = sequence.map((id, i) => (i === 0 ? `גע ב${label(id)}` : `אחר כך ב${label(id)}`));
  return parts.join(', ');
}

/* ---- סיפור מוקרא ---- */
export interface StoryStimulus {
  storyId: string;
  text: string;
}
/** בוחר סיפור דטרמיניסטית. השאלות עצמן נשלפות דרך מערכת החזרות המושהית. */
export function pickStory(seed: number) {
  const rng = makeRng(seed);
  return rng.pick(STORIES);
}

/** מזהי כל המנועים של הארץ הזו (לרישום). */
export const ECHOES_ENGINES = [listenRepeat, multiStep];
