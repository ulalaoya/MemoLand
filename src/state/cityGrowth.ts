import type { LandId } from '../types';

export const CITY_DISTRICT_BUILDING_COUNT = 15;
export const CITY_DISTRICT_BACK_ROW_SIZE = 8;
export const CITY_DISTRICT_FRONT_ROW_SIZE = 7;

export interface CityDistrictProgress {
  /** All successful City questions preserved across districts. */
  totalBuilt: number;
  completedDistricts: number;
  /** Zero-based district currently shown. */
  districtIndex: number;
  /** One-based district label for the child-facing scene. */
  districtNumber: number;
  /** Parts visible in the current project (0..15). */
  builtCount: number;
  districtComplete: boolean;
}

export function normalizeCityGrowthMilestones(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(value)));
}

/**
 * Maps the existing cumulative success counter into repeatable 15-part
 * projects. The fifteenth success completes the current project; the
 * sixteenth becomes the first part of the next project.
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
