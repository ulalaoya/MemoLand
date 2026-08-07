/* =========================================================================
   curriculum.ts — כל פרמטרי הרמות במקום אחד, קל לכוונון.
   כל אתגר: פונקציה (level 1..15) => פרמטרים לגירוי.
   ========================================================================= */

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 15;

/** מצמצם רמה לטווח החוקי. */
export function clampLevel(n: number): number {
  return Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, Math.round(n)));
}

/** אינטרפולציה לינארית של פרמטר לפי רמה, מעוגל. */
function lerp(level: number, atLevel1: number, atLevel15: number): number {
  const t = (clampLevel(level) - 1) / (MAX_LEVEL - 1);
  return Math.round(atLevel1 + (atLevel15 - atLevel1) * t);
}

/* ---------- ארץ 1: עמק המספרים ---------- */

/** רצף ספרות קדימה/הפוך/מיון: אורך הרצף לפי הרמה (3→9). */
export function digitSpanLength(level: number): number {
  return lerp(level, 3, 9);
}

/** זמן חשיפת כל ספרה במילישניות. מספיק ארוך כדי שההקראה של כל מספר תסתיים
    לפני הבא (אחרת מספרים נבלעים). */
export function digitFlashMs(level: number): number {
  return lerp(level, 1000, 850);
}

/** חשבון בשרשרת: כמה שלבים (2→6) וטווח מספרים. */
export function chainMathConfig(level: number): {
  steps: number;
  maxStart: number;
  maxDelta: number;
  revealMs: number;
} {
  return {
    steps: lerp(level, 2, 6),
    maxStart: lerp(level, 20, 60),
    maxDelta: lerp(level, 9, 20),
    revealMs: lerp(level, 3200, 2200),
  };
}

/* ---------- ארץ 2: מערת ההדים ---------- */

/** הקשב וחזור: כמה מילים במשפט (3→9). */
export function sentenceWordCount(level: number): number {
  return lerp(level, 3, 9);
}

/** הוראות מרובות שלבים: כמה הוראות (2→7). */
export function multiStepCount(level: number): number {
  return lerp(level, 2, 7);
}

/* ---------- אלגוריתם המדרגה ---------- */

/**
 * רמה מינימלית מותרת: לעולם לא מתחת ל-70% מהשיא שהושג.
 * (סעיף 7 בפרומפט.)
 */
export function floorFromPeak(peakLevel: number): number {
  return clampLevel(Math.max(MIN_LEVEL, Math.floor(peakLevel * 0.7)));
}

/** יעד דיוק שוטף. */
export const TARGET_ACCURACY = { min: 0.75, max: 0.85 };

/** כמה נכונות/שגויות רצופות מזיזות רמה. */
export const STAIRCASE = { upAfter: 2, downAfter: 2 };

/** סולם החזרות במרווחים (מ-10 דקות עד 7 ימים). */
export const SPACED_INTERVALS_MS: number[] = [
  10 * 60 * 1000, // 10 דקות
  0, // "סוף הסשן" — מטופל בקוד כ-due מיידי בסיום
  24 * 60 * 60 * 1000, // +1 יום
  3 * 24 * 60 * 60 * 1000, // +3 ימים
  7 * 24 * 60 * 60 * 1000, // +7 ימים
];

/* ---------- תגמולים ---------- */

/** מטבעות בסיס לכל תשובה נכונה. */
export const COINS_CORRECT = 10;
/** בונוס רצף (מוכפל ברצף עד תקרה). */
export const COINS_STREAK_BONUS = 3;
export const COINS_STREAK_CAP = 5;
/** בונוס מהירות (תחת סף זמן). */
export const COINS_SPEED_BONUS = 5;
export const SPEED_BONUS_MS = 4000;

/** ספי דרגות ממו לפי סך המטבעות. */
export const RANK_THRESHOLDS: { rank: string; min: number; label: string }[] = [
  { rank: 'beginner', min: 0, label: 'מתחיל' },
  { rank: 'scout', min: 300, label: 'סייר' },
  { rank: 'adventurer', min: 800, label: 'הרפתקן' },
  { rank: 'hero', min: 2000, label: 'גיבור' },
  { rank: 'legend', min: 5000, label: 'אגדת ממו לנד' },
];
