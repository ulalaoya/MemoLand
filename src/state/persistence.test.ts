import { describe, expect, it } from 'vitest';
import { LAND_ORDER } from '../config/lands';
import { SAVE_VERSION, defaultSave, normalizeSave } from './persistence';
import { cityDistrictProgress } from './cityGrowth';
import { defaultMultiplicationFactProgress } from './multiplicationProgress';

describe('SaveState migration', () => {
  it('preserves learning/profile data while initializing missing visual City growth to zero', () => {
    const current = defaultSave();
    const oldLands = Object.fromEntries(
      LAND_ORDER.filter((id) => id !== 'connections').map((id, index) => [id, {
        landId: id,
        unlockedTracks: index + 2,
        completedTracks: index + 1,
        castleOpen: id === 'numbers',
      }]),
    );
    const old = {
      ...current,
      version: 1,
      coins: 777,
      rank: 'adventurer',
      stats: { 'numbers.forward': { level: 6, peakLevel: 8, attempts: 20, correct: 15, streakCorrect: 1, bestStreak: 5, consecutiveWrong: 0, medianRtMs: 1234, rtSamples: [1234], maxSpan: 7 } },
      lands: oldLands,
      spaced: [{ id: 'keep', landId: 'echoes', kind: 'delayed', payload: { question: 'ש?', answer: 'ת' }, intervalIdx: 2, dueAt: 42, createdAt: 10 }],
      medals: [{ id: 'medal', tier: 'gold', earnedAt: 11 }],
      cosmetics: [{ id: 'hat', kind: 'hat', name: 'כובע' }],
      equipped: { hat: 'hat' },
      streakDays: 9,
      lastPlayedDay: '2026-08-27',
      streakShieldAvailable: false,
      todayPoints: 333,
      todayPointsDay: '2026-08-28',
      settings: { ...current.settings, sessionMinutes: 25, parentPin: '9876' },
      parentContent: { wordLists: [{ title: 'x', items: ['y'] }], sentences: ['z'], paragraphs: [{ title: 'p', text: 't' }] },
      multiplication: {
        facts: {
          '2x2': {
            ...defaultMultiplicationFactProgress('2x2'),
            directCorrect: 7,
            supportedCorrect: 4,
            stage: 'FLUENT' as const,
          },
        },
        recentAttempts: [],
      },
      history: [{ day: '2026-08-27', minutes: 12, perLand: { numbers: { attempts: 3, correct: 2 } } }],
    };
    delete (old as Partial<typeof old>).cityGrowthMilestones;

    const migrated = normalizeSave(old);
    expect(migrated.version).toBe(SAVE_VERSION);
    for (const id of LAND_ORDER.filter((land) => land !== 'connections')) {
      expect(migrated.lands[id]).toEqual(oldLands[id]);
    }
    expect(migrated.lands.connections).toEqual({ landId: 'connections', unlockedTracks: 1, completedTracks: 0, castleOpen: false });
    expect(migrated.multiplication.facts['2x2'].directCorrect).toBe(7);
    expect(migrated.multiplication.facts['2x2'].supportedCorrect).toBe(4);
    expect(migrated.multiplication.facts['2x2'].stage).toBe('FLUENT');
    expect(migrated.cityGrowthMilestones).toBe(0);
    for (const key of ['coins', 'rank', 'stats', 'spaced', 'medals', 'cosmetics', 'equipped', 'streakDays', 'lastPlayedDay', 'streakShieldAvailable', 'todayPoints', 'todayPointsDay', 'settings', 'parentContent', 'history'] as const) {
      expect(migrated[key]).toEqual(old[key]);
    }
  });

  it('normalizes a same-version save that is missing nested City fields', () => {
    const partial = { ...defaultSave(), multiplication: undefined };
    delete (partial.lands as Partial<typeof partial.lands>).connections;
    const migrated = normalizeSave(partial);
    expect(migrated.lands.connections.landId).toBe('connections');
    expect(migrated.multiplication.recentAttempts).toEqual([]);
    expect(migrated.cityGrowthMilestones).toBe(0);
  });

  it('normalizes persisted City growth without affecting other fields', () => {
    const current = defaultSave();
    const migrated = normalizeSave({ ...current, coins: 55, cityGrowthMilestones: 14.8 });
    expect(migrated.cityGrowthMilestones).toBe(14);
    expect(migrated.coins).toBe(55);
  });

  it('preserves cumulative City growth above the former cap and maps rollover without data loss', () => {
    const current = defaultSave();
    const atBoundary = normalizeSave({ ...current, cityGrowthMilestones: 40 });
    const afterBoundary = normalizeSave({ ...current, cityGrowthMilestones: 41 });

    expect(atBoundary.cityGrowthMilestones).toBe(40);
    expect(cityDistrictProgress(atBoundary.cityGrowthMilestones)).toMatchObject({
      completedDistricts: 2,
      districtIndex: 1,
      builtCount: 20,
      districtComplete: true,
    });
    expect(afterBoundary.cityGrowthMilestones).toBe(41);
    expect(cityDistrictProgress(afterBoundary.cityGrowthMilestones)).toMatchObject({
      completedDistricts: 2,
      districtIndex: 2,
      builtCount: 1,
      districtComplete: false,
    });
  });

  it('adds resumable journey and anti-repeat fields without losing an older child save', () => {
    const old = { ...defaultSave(), version: 3, coins: 912, dailyJourney: undefined, recentChallengeFingerprints: undefined };
    const migrated = normalizeSave(old);
    expect(migrated.coins).toBe(912);
    expect(migrated.dailyJourney).toMatchObject({ status: 'not-started', currentActivity: 0, earnedPoints: 0 });
    expect(migrated.dailyJourney.plan).toEqual([]);
    expect(migrated.recentChallengeFingerprints).toEqual([]);
  });
});
