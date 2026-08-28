/* חישובי תגמול: מטבעות, דרגת ממו, מדליות. אין ניקוד שלילי לעולם. */
import type { Medal, MemoRank, SaveState } from '../types';
import {
  COINS_CORRECT,
  COINS_SPEED_BONUS,
  COINS_STREAK_BONUS,
  COINS_STREAK_CAP,
  RANK_THRESHOLDS,
  SPEED_BONUS_MS,
} from '../config/curriculum';

/** מטבעות עבור תשובה נכונה; בונוס מהירות ניתן רק בעולמות שאישרו אותו. */
export function coinsForCorrect(streak: number, rtMs: number, allowSpeedBonus = true): number {
  const streakBonus = Math.min(streak, COINS_STREAK_CAP) * COINS_STREAK_BONUS;
  const speedBonus = allowSpeedBonus && rtMs > 0 && rtMs <= SPEED_BONUS_MS ? COINS_SPEED_BONUS : 0;
  return COINS_CORRECT + streakBonus + speedBonus;
}

/** דרגת ממו לפי סך המטבעות. */
export function rankForCoins(coins: number): MemoRank {
  let rank: MemoRank = 'beginner';
  for (const t of RANK_THRESHOLDS) {
    if (coins >= t.min) rank = t.rank as MemoRank;
  }
  return rank;
}

export function rankLabel(rank: MemoRank): string {
  return RANK_THRESHOLDS.find((t) => t.rank === rank)?.label ?? 'מתחיל';
}

/** מדד ההתקדמות לדרגה הבאה (0..1) והסף הבא. */
export function rankProgress(coins: number): { next: number | null; ratio: number } {
  const idx = RANK_THRESHOLDS.reduce((acc, t, i) => (coins >= t.min ? i : acc), 0);
  const cur = RANK_THRESHOLDS[idx];
  const nxt = RANK_THRESHOLDS[idx + 1];
  if (!nxt) return { next: null, ratio: 1 };
  const ratio = (coins - cur.min) / (nxt.min - cur.min);
  return { next: nxt.min, ratio: Math.max(0, Math.min(1, ratio)) };
}

/** בודק אילו מדליות חדשות הושגו על סמך המצב, ומחזיר רק חדשות. */
export function newlyEarnedMedals(state: SaveState, now: number): Medal[] {
  const have = new Set(state.medals.map((m) => m.id));
  const earned: Medal[] = [];
  const add = (id: string, tier: Medal['tier']) => {
    if (!have.has(id)) earned.push({ id, tier, earnedAt: now });
  };

  // 7 ימים ברצף
  if (state.streakDays >= 7) add('streak7', 'gold');
  // span של 7 ספרות
  const maxSpan = Math.max(0, ...Object.values(state.stats).map((s) => s.maxSpan));
  if (maxSpan >= 7) add('span7', 'silver');
  // ארץ שהושלמה (טירה נפתחה)
  if (Object.values(state.lands).some((l) => l.castleOpen)) add('land-complete', 'bronze');
  // 1000 מטבעות
  if (state.coins >= 1000) add('coins1000', 'gold');

  return earned;
}
