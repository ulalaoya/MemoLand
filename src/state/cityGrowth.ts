import type { LandId } from '../types';

export const CITY_DISTRICT_BUILDING_COUNT = 20;
export const CITY_DISTRICT_ROW_SIZE = 10;

export interface CityDistrictProgress {
  /** All successful City questions preserved across districts. */
  totalBuilt: number;
  completedDistricts: number;
  /** Zero-based district currently shown. */
  districtIndex: number;
  /** One-based district label for the child-facing scene. */
  districtNumber: number;
  /** Buildings visible in the current district (0..20). */
  builtCount: number;
  districtComplete: boolean;
}

export function normalizeCityGrowthMilestones(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(value)));
}

/**
 * Maps the existing cumulative success counter into repeatable 20-building
 * districts. The twentieth success remains visible as a completed district;
 * the twenty-first starts the next empty district with its first building.
 */
export function cityDistrictProgress(value: unknown): CityDistrictProgress {
  const totalBuilt = normalizeCityGrowthMilestones(value);
  const districtIndex = totalBuilt === 0
    ? 0
    : Math.floor((totalBuilt - 1) / CITY_DISTRICT_BUILDING_COUNT);
  const builtCount = totalBuilt === 0
    ? 0
    : ((totalBuilt - 1) % CITY_DISTRICT_BUILDING_COUNT) + 1;
  return {
    totalBuilt,
    completedDistricts: Math.floor(totalBuilt / CITY_DISTRICT_BUILDING_COUNT),
    districtIndex,
    districtNumber: districtIndex + 1,
    builtCount,
    districtComplete: totalBuilt > 0 && totalBuilt % CITY_DISTRICT_BUILDING_COUNT === 0,
  };
}

export function cityGrowthAfterCompletedQuestion(
  current: number,
  landId: LandId,
  correct: boolean,
): number {
  const normalized = normalizeCityGrowthMilestones(current);
  if (landId !== 'connections' || !correct) return normalized;
  return normalizeCityGrowthMilestones(normalized + 1);
}
