/* =========================================================================
   מתזמן חזרות במרווחים.
   10 דקות → סוף סשן → +1 יום → +3 ימים → +7 ימים.
   פריט שנכשל חוזר למרווח הקודם.
   ========================================================================= */
import type { SpacedItem } from '../types';
import { SPACED_INTERVALS_MS } from '../config/curriculum';

/** יוצר פריט חדש לתור, מתוזמן לחשיפה הראשונה (10 דקות). */
export function makeSpacedItem(
  base: Omit<SpacedItem, 'intervalIdx' | 'dueAt' | 'createdAt'>,
  now: number,
): SpacedItem {
  return {
    ...base,
    intervalIdx: 0,
    createdAt: now,
    dueAt: now + SPACED_INTERVALS_MS[0],
  };
}

/** הפריטים שבשלו לחזרה עכשיו. */
export function dueItems(items: SpacedItem[], now: number): SpacedItem[] {
  return items.filter((it) => it.dueAt <= now);
}

/**
 * מקדם פריט אחרי חזרה מוצלחת: עולה מרווח אחד.
 * כשמגיע לסוף הסולם — הפריט "בוגר" ומוסר מהתור (מחזיר null).
 */
export function advanceOnSuccess(item: SpacedItem, now: number): SpacedItem | null {
  const nextIdx = item.intervalIdx + 1;
  if (nextIdx >= SPACED_INTERVALS_MS.length) return null; // בוגר
  return { ...item, intervalIdx: nextIdx, dueAt: now + SPACED_INTERVALS_MS[nextIdx] };
}

/** אחרי כישלון: חוזר למרווח הקודם (לא יורד מתחת ל-0). */
export function regressOnFailure(item: SpacedItem, now: number): SpacedItem {
  const prevIdx = Math.max(0, item.intervalIdx - 1);
  return { ...item, intervalIdx: prevIdx, dueAt: now + SPACED_INTERVALS_MS[prevIdx] };
}

/** מקדם/מחזיר את כל פריטי "סוף הסשן" (intervalIdx===0 עם מרווח 0) להיות due מיידית. */
export function markEndOfSessionDue(items: SpacedItem[], now: number): SpacedItem[] {
  return items.map((it) => (it.intervalIdx === 0 ? { ...it, dueAt: now } : it));
}
