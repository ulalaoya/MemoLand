import type { LandId } from '../types';

export const CITY_GROWTH_MILESTONE_LIMIT = 30;

export function normalizeCityGrowthMilestones(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(CITY_GROWTH_MILESTONE_LIMIT, Math.floor(value)));
}

export function cityGrowthAfterCompletedQuestion(
  current: number,
  landId: LandId,
  correct: boolean,
): number {
  const normalized = normalizeCityGrowthMilestones(current);
  if (landId !== 'connections' || !correct) return normalized;
  return Math.min(CITY_GROWTH_MILESTONE_LIMIT, normalized + 1);
}
