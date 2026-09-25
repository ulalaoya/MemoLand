/* =========================================================================
   בניית המסע של היום (הסשן היומי).
   המסע משלב שני מקטעי שליפה ישירה בעיר לצד רוטציה בין שאר הארצות.
   הרוטציה בוחרת את החלשות ביותר, אך תמיד כוללת לפחות ארץ אחת "חזקה".
   ========================================================================= */
import type { DailySession, ExerciseId, ExerciseStats, LandId, SessionStep } from '../types';
import { enginesForLand, playableLands } from '../engines';
import { accuracy } from './leveling';

/** מספר הסבבים בשלב הרוטציה מותאם לאורך הסשן. */
function rotationRounds(minutes: number): number {
  if (minutes <= 10) return 4;
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
  const rounds = rotationRounds(minutes);
  // City has its two fixed blocks and Speed has its single continuous race.
  const regularWeak = weak.filter((land) => land !== 'connections' && land !== 'speed');

  // Every journey visits all seven worlds. Numbers opens the route; the four
  // regular worlds below are guaranteed once before adaptive repeats begin.
  const requiredRotationLands: LandId[] = ['echoes', 'forest', 'patterns', 'castle'];
  const adaptiveOrder = regularWeak.length > 0 ? regularWeak : requiredRotationLands;
  const rotationLands = [...requiredRotationLands];
  while (rotationLands.length < rounds) {
    rotationLands.push(adaptiveOrder[(rotationLands.length - requiredRotationLands.length) % adaptiveOrder.length]);
  }

  const warmupLand: LandId = 'numbers';
  const speedLand: LandId = 'speed'; // קטע הטיימר נשאר במסלול הזריזות בלבד

  const steps: SessionStep[] = [];

  // 1. חימום — קל, בארץ שהילד שולט בה
  steps.push({
    kind: 'warmup',
    label: 'חימום — ממו יוצא לדרך',
    landId: warmupLand,
    exerciseId: pickExercise(warmupLand, stats),
    rounds: 2,
  });

  // 2. עשר שליפות ישירות בעיר — מקטע ראשון וקבוע בכל משך מסע.
  steps.push({
    kind: 'connections-practice',
    label: 'בונים את עיר הקשרים',
    landId: 'connections',
    exerciseId: 'connections.direct',
    rounds: 10,
  });

  // 3. המשימה המושהית נחשפת (סיפור/רשימה) — לא נשאל עכשיו
  steps.push({
    kind: 'delayed-reveal',
    label: 'סוד לזכור — שמור אותו בלב',
    landId: 'echoes',
    rounds: 1,
  });

  // 4. "מה שזכרת אתמול" — חזרה במרווחים
  if (hasYesterday) {
    steps.push({ kind: 'yesterday', label: 'מה שזכרת אתמול', rounds: 1 });
  }

  // 5. רוטציה — ביקור מובטח במערה, ביער, בהרים ובטירה; אחר כך התאמה לחולשות.
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

  // 6. אתגר מהירות — עם טיימר, מסגור חיובי בלבד
  steps.push({
    kind: 'speed',
    label: 'כמה תספיק ב-60 שניות?',
    landId: speedLand,
    exerciseId: pickExercise(speedLand, stats),
    rounds: 99, // עד שהטיימר נגמר
    hasTimer: true,
    timerSeconds: 60,
  });

  // 7. שליפה מושהית — שאלות על הפריט שנחשף קודם
  steps.push({ kind: 'delayed-recall', label: 'זוכר את הסוד?', rounds: 1 });

  // 8. עשר שליפות ישירות נוספות — אחרי פעילויות מארצות אחרות.
  steps.push({
    kind: 'connections-practice',
    label: 'ממשיכים לבנות את העיר',
    landId: 'connections',
    exerciseId: 'connections.direct',
    rounds: 10,
  });

  // 9. סיום מובטח — קל בוודאות, ואז תיבת האוצר
  steps.push({
    kind: 'guaranteed-finish',
    label: 'ישר לטירה — סיבוב ניצחון',
    landId: warmupLand,
    exerciseId: pickExercise(warmupLand, stats),
    rounds: 2,
  });

  return { steps, builtAt: now, targetMinutes: minutes };
}
