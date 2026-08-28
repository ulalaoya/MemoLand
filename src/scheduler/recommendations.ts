/* מנוע המלצות שבועיות — כללים דטרמיניסטיים (לא LLM). טבלת חוקים מפורשת. */
import type { LandId, SaveState } from '../types';
import { LANDS, landColor } from '../config/lands';
import { enginesForLand, playableLands } from '../engines';
import { accuracy } from './leveling';

export interface Recommendation {
  id: string;
  text: string;
  color: string;
}

/** דיוק ממוצע בארץ (על פני המנועים שלה). */
function landAccuracy(state: SaveState, land: LandId): number | null {
  const engs = enginesForLand(land);
  const accs = engs.map((e) => state.stats[e.id]).filter(Boolean).map(accuracy);
  if (accs.length === 0) return null;
  return accs.reduce((a, b) => a + b, 0) / accs.length;
}

/** ימים מאז שהארץ תורגלה. */
function daysSincePracticed(state: SaveState, land: LandId): number {
  const days = state.history.filter((h) => h.perLand[land]).map((h) => h.day);
  if (days.length === 0) return 99;
  const last = days.sort().at(-1)!;
  const diff = (Date.now() - new Date(last).getTime()) / (24 * 60 * 60 * 1000);
  return Math.floor(diff);
}

/** מגמת זמן תגובה: האם עולה (איטי יותר)? משווה חציון נוכחי לממוצע דגימות. */
function rtRising(state: SaveState): boolean {
  // זמני עיר הקשרים אינם מדד מהירות ואינם מזינים המלצה בפני עצמם.
  const medians = Object.entries(state.stats)
    .filter(([exerciseId]) => !exerciseId.startsWith('connections.'))
    .map(([, stats]) => stats.medianRtMs)
    .filter((m) => m > 0);
  return medians.length > 0 && medians.reduce((a, b) => a + b, 0) / medians.length > 5000;
}

/** מייצר המלצות לפי טבלת החוקים. */
export function weeklyRecommendations(state: SaveState): Recommendation[] {
  const recs: Recommendation[] = [];

  // חוק: דיוק שמיעתי < 70% → הצע הוראות פיזיות מחוץ למסך
  const echoAcc = landAccuracy(state, 'echoes');
  if (echoAcc !== null && echoAcc < 0.7) {
    recs.push({ id: 'echo-physical', color: landColor('echoes'), text: 'הזיכרון השמיעתי מאותגר. נסו 5 דקות של "הוראות פיזיות" מחוץ למסך — למשל שרשרת בקשות בבית.' });
  }

  // חוק: זמן תגובה עולה → קצר את הסשן ובדוק שינה
  if (rtRising(state)) {
    recs.push({ id: 'rt-rising', color: landColor('numbers'), text: 'זמן התגובה עולה. שווה לקצר את המסע ל-10–15 דקות ולבדוק שהילד ישן מספיק.' });
  }

  // חוק: ארץ שלא תורגלה 5 ימים → תיכלל במסע של מחר
  for (const land of playableLands()) {
    if (daysSincePracticed(state, land) >= 5) {
      recs.push({ id: `stale-${land}`, color: landColor(land), text: `${LANDS[land].name} לא תורגלה כמה ימים — היא תיכלל במסע של מחר.` });
    }
  }

  // חוק: קפיצה ב-span → הצע להעלות קושי
  const maxSpan = Math.max(0, ...Object.values(state.stats).map((s) => s.maxSpan));
  if (maxSpan >= 6) {
    recs.push({ id: 'span-jump', color: landColor('numbers'), text: `קפיצה יפה בטווח הזיכרון (${maxSpan} פריטים)! אפשר לתת לילד אתגר גדול יותר.` });
  }

  // ברירת מחדל חיובית אם אין המלצות
  if (recs.length === 0) {
    recs.push({ id: 'keep-going', color: landColor('castle'), text: 'התרגול עקבי ומאוזן — פשוט להמשיך כך. כל הכבוד!' });
  }

  return recs;
}
