/* =========================================================================
   בניית המסע של היום (הסשן היומי).
   המסע משלב מקטע רציף של פאזל עיר לצד רוטציה בין שאר הארצות.
   הרוטציה בוחרת את החלשות ביותר, אך תמיד כוללת לפחות ארץ אחת "חזקה".
   ========================================================================= */
import type { DailySession, ExerciseId, ExerciseStats, LandId, SessionStep } from '../types';
import { enginesForLand, playableLands } from '../engines';
import { accuracy } from './leveling';

/** מספר הסבבים בשלב הרוטציה מותאם לאורך הסשן. */
function rotationRounds(minutes: number): number {
  if (minutes <= 10) return 5;
  if (minutes <= 15) return 6;
  if (minutes <= 20) return 8;
  return 10;
}

/** ממיין ארצות לפי דיוק (החלש קודם). */
function landsByWeakness(stats: Record<ExerciseId, ExerciseStats>): LandId[] {
  const lands = playableLands();
  const score = (land: LandId): number => {
    const engs = enginesForLand(land);
    const accs = engs
      .map((e) => stats[e.id])
      .filter(Boolean)
      .map((s) => accuracy(s));
    if (accs.length === 0) return 0.5; // חדש — עדיפות בינונית
    return accs.reduce((a, b) => a + b, 0) / accs.length;
  };
  return [...lands].sort((a, b) => score(a) - score(b));
}

/** בוחר אתגר מתוך ארץ — האתגר עם הכי מעט ניסיונות (למען גיוון). */
function pickExercise(land: LandId, stats: Record<ExerciseId, ExerciseStats>): ExerciseId {
  const engs = enginesForLand(land);
  return engs
    .map((e) => ({ id: e.id, attempts: stats[e.id]?.attempts ?? 0 }))
    .sort((a, b) => a.attempts - b.attempts)[0].id;
}

/**
 * בונה את המסע של היום. דטרמיניסטי ביחס למצב הנתון.
 * hasYesterday — האם יש פריט חזרה מאתמול (משפיע על שלב 3).
 */
export function buildDailySession(
  stats: Record<ExerciseId, ExerciseStats>,
  minutes: number,
  hasYesterday: boolean,
  now: number,
): DailySession {
  const weak = landsByWeakness(stats);
  const requestedRounds = rotationRounds(minutes);
  // City has one fixed 15-question puzzle and Speed has its single continuous race.
  const regularWeak = weak.filter((land) => land !== 'connections' && land !== 'speed');

  // Every journey visits all eight worlds. Numbers opens the route; the five
  // regular worlds below are guaranteed once before adaptive repeats begin.
  // Echo and Firefly are short memory challenges. Two consecutive challenges
  // make their existing deterministic variety visible to the child, instead of
  // leaving each world immediately after a single sentence/grid.
  const requiredRotationLands: LandId[] = [
    'echoes', 'echoes',
    'forest', 'forest',
    'patterns', 'cars', 'castle',
  ];
  const rounds = Math.max(requestedRounds, requiredRotationLands.length);
  const adaptiveOrder = regularWeak.length > 0 ? regularWeak : requiredRotationLands;
  const rotationLands = [...requiredRotationLands];
  while (rotationLands.length < rounds) {
    rotationLands.push(adaptiveOrder[(rotationLands.length - requiredRotationLands.length) % adaptiveOrder.length]);
  }

  const warmupLand: LandId = 'numbers';
  const speedLand: LandId = 'speed'; // קטע הטיימר נשאר במסלול הזריזות בלבד

  const steps: SessionStep[] = [];

  // סוד המסע מוצג במסך עצמו לפני הפעילות הראשונה ונשלף ממש לפני הסיום.
  // הוא אינו שלב משחק כדי שלא יאריך או יסבך את תוכנית המסע.

  // 1. חימום — קל, בארץ שהילד שולט בה
  steps.push({
    kind: 'warmup',
    label: 'חימום — ממו יוצא לדרך',
    landId: warmupLand,
    exerciseId: pickExercise(warmupLand, stats),
    rounds: 2,
  });

  // 2. פאזל עיר רציף — כל 15 החלקים נפתרים לפני שעוברים לעולם הבא.
  steps.push({
    kind: 'connections-practice',
    label: 'משלימים את פסיפס הכפל',
    landId: 'connections',
    exerciseId: 'connections.direct',
    rounds: 15,
  });

  // 3. "מה שזכרת אתמול" — חזרה במרווחים
  if (hasYesterday) {
    steps.push({ kind: 'yesterday', label: 'מה שזכרת אתמול', rounds: 1 });
  }

  // 4. רוטציה — ביקור מובטח במערה, ביער, בהרים, בעיר המכוניות ובטירה.
  for (let i = 0; i < rounds; i++) {
    const land: LandId = rotationLands[i % rotationLands.length];
    steps.push({
      kind: 'rotation',
      label: 'הרפתקה',
      landId: land,
      exerciseId: pickExercise(land, stats),
      rounds: 1,
    });
  }

  // 5. אתגר מהירות — עם טיימר, מסגור חיובי בלבד
  steps.push({
    kind: 'speed',
    label: 'כמה תספיק ב-60 שניות?',
    landId: speedLand,
    exerciseId: pickExercise(speedLand, stats),
    rounds: 99, // עד שהטיימר נגמר
    hasTimer: true,
    timerSeconds: 60,
  });

  // 6. סיום מובטח — קל בוודאות, אחריו שליפת סוד המסע ואז תיבת האוצר
  steps.push({
    kind: 'guaranteed-finish',
    label: 'ישר לטירה — סיבוב ניצחון',
    landId: warmupLand,
    exerciseId: pickExercise(warmupLand, stats),
    rounds: 2,
  });

  return { steps, builtAt: now, targetMinutes: minutes };
}
