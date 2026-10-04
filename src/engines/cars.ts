import type { Challenge, ExerciseEngine } from '../types';
import { clampLevel } from '../config/curriculum';
import { makeRng } from './rng';

export interface CarPlateStimulus {
  plate: string;
  exposureMs: number;
}

/** Displays a numeric memory value like a local plate: 123-4 / 123-45 / 123-456. */
export function formatCarPlate(value: string, totalLength = value.length): string {
  if (totalLength <= 3 || value.length < 3) return value;
  return `${value.slice(0, 3)}-${value.slice(3)}`;
}

export const carPlateMemory: ExerciseEngine<CarPlateStimulus, string> = {
  id: 'cars.plates',
  landId: 'cars',
  title: 'זוכרים את הלוחית',
  parentDescription: 'זיכרון עבודה — זכירת רצף ספרות מלוחית רישוי',
  generate(level, seed): Challenge<CarPlateStimulus, string> {
    const safeLevel = clampLevel(level);
    // Make the first increase visible quickly: the adaptive staircase raises a
    // level after two consecutive successes, so level 2 already uses 4 digits.
    const length = safeLevel === 1 ? 3 : safeLevel <= 4 ? 4 : safeLevel <= 8 ? 5 : 6;
    const exposureMs = Math.round(3200 - ((safeLevel - 1) / 14) * 1500);
    const rng = makeRng(seed);
    const digits = Array.from({ length }, (_, index) => {
      const min = index === 0 ? 1 : 0;
      return String(rng.int(min, 9));
    });
    const plate = digits.join('');
    return {
      exerciseId: this.id,
      landId: 'cars',
      level: safeLevel,
      stimulus: { plate, exposureMs },
      answer: plate,
      params: { plateLength: length, exposureMs },
      prompt: 'זכור את לוחית הרישוי',
    };
  },
  check(challenge, given) {
    return given === challenge.answer;
  },
};
