/* מרשם מנועי התרגילים. הוספת ארץ = הוספת המנועים שלה כאן. */
import type { ExerciseEngine, ExerciseId, LandId } from '../types';
import { chainMath, digitBackward, digitForward, digitSort } from './numbers';
import { listenRepeat, multiStep } from './echoes';
import { forestGrid } from './forest';
import { patternComplete } from './patterns';
import { speedMatch } from './speed';
import { castleMemorize } from './castle';
import { connectionsDirect, connectionsDerived, connectionsLink } from './connections';

export const ENGINES: ExerciseEngine[] = [
  // ארץ 1 — עמק המספרים
  digitForward,
  digitBackward,
  digitSort,
  chainMath,
  // ארץ 2 — מערת ההדים
  listenRepeat,
  multiStep,
  // ארץ 3 — עיר הקשרים
  connectionsDirect,
  connectionsDerived,
  connectionsLink,
  // ארץ 4 — יער התמונות
  forestGrid,
  // ארץ 4 — הרי התבניות
  patternComplete,
  // ארץ 5 — מסלול הזריזות
  speedMatch,
  // ארץ 6 — טירת האוצר
  castleMemorize,
];

const BY_ID = new Map<ExerciseId, ExerciseEngine>(ENGINES.map((e) => [e.id, e]));

// מנועים שנשמרים בארכיטקטורה אך אינם מוצגים כרגע כאתגר עצמאי לילד.
const BETA_DISABLED_ENGINE_IDS = new Set<ExerciseId>([
  'echoes.multistep',
  'connections.derived',
  'connections.link',
]);

function isActiveBetaEngine(engine: ExerciseEngine): boolean {
  return !BETA_DISABLED_ENGINE_IDS.has(engine.id);
}

export function getEngine(id: ExerciseId): ExerciseEngine | undefined {
  return BY_ID.get(id);
}

export function enginesForLand(landId: LandId): ExerciseEngine[] {
  return ENGINES.filter((e) => e.landId === landId && isActiveBetaEngine(e));
}

/** ארצות שכבר משוחקות (יש להן מנועים). שאר הארצות "בקרוב". */
export function playableLands(): LandId[] {
  return Array.from(new Set(ENGINES.filter(isActiveBetaEngine).map((e) => e.landId)));
}

export {
  chainMath,
  digitBackward,
  digitForward,
  digitSort,
  listenRepeat,
  multiStep,
  connectionsDirect,
  connectionsDerived,
  connectionsLink,
  forestGrid,
  patternComplete,
  speedMatch,
  castleMemorize,
};
