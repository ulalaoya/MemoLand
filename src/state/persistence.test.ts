import { describe, expect, it } from 'vitest';
import { LAND_ORDER } from '../config/lands';
import { SAVE_VERSION, defaultSave, normalizeSave } from './persistence';

describe('SaveState v1 → v2 migration', () => {
  it('preserves every existing profile field and land while adding City state', () => {
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
      history: [{ day: '2026-08-27', minutes: 12, perLand: { numbers: { attempts: 3, correct: 2 } } }],
    };

    const migrated = normalizeSave(old);
    expect(migrated.version).toBe(SAVE_VERSION);
    for (const id of LAND_ORDER.filter((land) => land !== 'connections')) {
      expect(migrated.lands[id]).toEqual(oldLands[id]);
    }
    expect(migrated.lands.connections).toEqual({ landId: 'connections', unlockedTracks: 1, completedTracks: 0, castleOpen: false });
    expect(migrated.multiplication).toEqual({ facts: {}, recentAttempts: [] });
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
  });
});
