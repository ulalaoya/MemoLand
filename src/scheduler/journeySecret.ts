import type { JourneySecret } from '../types';
import { makeRng } from '../engines/rng';

const WORD_GROUPS = [
  ['אריה', 'דולפין', 'ינשוף'],
  ['כדור', 'מפתח', 'פנס'],
  ['תפוח', 'ענן', 'גשר'],
  ['רכבת', 'פרפר', 'כוכב'],
  ['חלון', 'גיטרה', 'סירה'],
] as const;

const NUMBER_GROUPS = [
  ['24', '57', '83'],
  ['31', '68', '95'],
  ['42', '76', '19'],
  ['53', '27', '84'],
  ['61', '38', '92'],
] as const;

/** Builds one stable, fair three-choice secret from the persisted journey seed. */
export function createJourneySecret(seed: number): JourneySecret {
  const rng = makeRng(seed ^ 0x51ec7e7);
  const kind: JourneySecret['kind'] = rng.int(0, 1) === 0 ? 'word' : 'number';
  const groups: readonly (readonly [string, string, string])[] = kind === 'word'
    ? WORD_GROUPS
    : NUMBER_GROUPS;
  const group = rng.pick(groups);
  const value = rng.pick(group);
  return {
    kind,
    value,
    options: rng.shuffle(group) as [string, string, string],
    revealed: false,
    recallStarted: false,
    answered: false,
    wasCorrect: null,
    rewardClaimed: false,
  };
}
