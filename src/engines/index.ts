/* מרשם מנועי התרגילים. הוספת ארץ = הוספת המנועים שלה כאן.
   השלד תומך בכל 6 הארצות; ארצות 1–2 ממומשות במלואן.
   ארצות 3–6 יתווספו כמנועים נוספים (ה-UI כבר יודע לרנדר לפי landId). */
import type { ExerciseEngine, ExerciseId, LandId } from '../types';
import { chainMath, digitBackward, digitForward, digitSort } from './numbers';
import { listenRepeat, multiStep } from './echoes';

export const ENGINES: ExerciseEngine[] = [
  // ארץ 1 — עמק המספרים
  digitForward,
  digitBackward,
  digitSort,
  chainMath,
  // ארץ 2 — מערת ההדים
  listenRepeat,
  multiStep,
];

const BY_ID = new Map<ExerciseId, ExerciseEngine>(ENGINES.map((e) => [e.id, e]));

export function getEngine(id: ExerciseId): ExerciseEngine | undefined {
  return BY_ID.get(id);
}

export function enginesForLand(landId: LandId): ExerciseEngine[] {
  return ENGINES.filter((e) => e.landId === landId);
}

/** ארצות שכבר משוחקות (יש להן מנועים). שאר הארצות "בקרוב". */
export function playableLands(): LandId[] {
  return Array.from(new Set(ENGINES.map((e) => e.landId)));
}

export { chainMath, digitBackward, digitForward, digitSort, listenRepeat, multiStep };
