/* =========================================================================
   אלגוריתם המדרגה (staircase) + עדכון מדדים לכל אתגר.
   2 נכונות רצופות → רמה למעלה. 2 שגויות רצופות → רמה למטה,
   אך לעולם לא מתחת ל-70% מהשיא. יעד דיוק 75%–85%.
   ========================================================================= */
import type { ExerciseStats } from '../types';
import { STAIRCASE, clampLevel, floorFromPeak } from '../config/curriculum';

/** מצב התחלתי לאתגר חדש. */
export function initialStats(): ExerciseStats {
  return {
    level: 1,
    peakLevel: 1,
    attempts: 0,
    correct: 0,
    streakCorrect: 0,
    bestStreak: 0,
    consecutiveWrong: 0,
    medianRtMs: 0,
    rtSamples: [],
    maxSpan: 0,
  };
}

/** חציון מתוך דגימות. */
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

export interface AttemptResult {
  correct: boolean;
  rtMs: number;
  /** span/אורך שהושג באתגר הזה (למדד maxSpan). אופציונלי. */
  span?: number;
}

/**
 * מעדכן מדדים ורמה אחרי ניסיון. פונקציה טהורה — מחזירה סטטיסטיקה חדשה.
 * שומר על השמורה: הרמה לעולם לא יורדת מתחת ל-70% מהשיא.
 */
export function applyAttempt(prev: ExerciseStats, res: AttemptResult): ExerciseStats {
  const rtSamples = [...prev.rtSamples, res.rtMs].slice(-20);
  const stats: ExerciseStats = {
    ...prev,
    attempts: prev.attempts + 1,
    correct: prev.correct + (res.correct ? 1 : 0),
    rtSamples,
    medianRtMs: median(rtSamples),
    maxSpan: Math.max(prev.maxSpan, res.span ?? 0),
  };

  if (res.correct) {
    stats.streakCorrect = prev.streakCorrect + 1;
    stats.bestStreak = Math.max(prev.bestStreak, stats.streakCorrect);
    stats.consecutiveWrong = 0;
    if (stats.streakCorrect >= STAIRCASE.upAfter) {
      stats.level = clampLevel(prev.level + 1);
      stats.streakCorrect = 0; // מאפסים אחרי עלייה
    }
  } else {
    stats.streakCorrect = 0;
    stats.consecutiveWrong = prev.consecutiveWrong + 1;
    if (stats.consecutiveWrong >= STAIRCASE.downAfter) {
      const floor = floorFromPeak(prev.peakLevel);
      stats.level = Math.max(floor, clampLevel(prev.level - 1));
      stats.consecutiveWrong = 0;
    }
  }

  stats.peakLevel = Math.max(prev.peakLevel, stats.level);
  return stats;
}

/** דיוק שוטף (0..1). */
export function accuracy(stats: ExerciseStats): number {
  return stats.attempts === 0 ? 0 : stats.correct / stats.attempts;
}

/**
 * האם להקל את האתגר בשקט? (אחרי 2 טעויות רצופות — סעיף 4 בפרומפט:
 * "אחרי 2 תשובות שגויות ברצף התרגיל מקל את עצמו בשקט ומציע רמז".)
 * הבדיקה נעשית *לפני* איפוס consecutiveWrong, ולכן על ה-caller לבדוק זאת
 * מול מונה מקומי בסשן. כאן פונקציה עזר שקוראת מונה חיצוני.
 */
export function shouldSoftenHint(consecutiveWrongInSession: number): boolean {
  return consecutiveWrongInSession >= 2;
}
