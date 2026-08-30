import { describe, expect, it } from 'vitest';
import { applyAttempt, initialStats } from './leveling';
import {
  advanceOnSuccess,
  dueItems,
  makeSpacedItem,
  regressOnFailure,
} from './spacedRepetition';
import { buildDailySession } from './session';
import {
  buildActivities,
  buildDailySupplementalActivity,
  buildFreePlayActivities,
  FREE_PLAY_ACTIVITY_COUNT,
  shouldAdvanceAfterCompletedIncorrect,
} from './activities';
import { SPACED_INTERVALS_MS, floorFromPeak } from '../config/curriculum';
import type { ExerciseStats, SpacedItem } from '../types';
import { LAND_ORDER } from '../config/lands';

describe('world registry order', () => {
  it('inserts City as world 3 without renaming persisted land ids', () => {
    expect(LAND_ORDER).toEqual(['numbers', 'echoes', 'connections', 'forest', 'patterns', 'speed', 'castle']);
  });
});

describe('מדרגה — עלייה וירידה', () => {
  it('2 נכונות רצופות מעלות רמה', () => {
    let s = initialStats();
    s = applyAttempt(s, { correct: true, rtMs: 1000 });
    expect(s.level).toBe(1); // עוד לא
    s = applyAttempt(s, { correct: true, rtMs: 1000 });
    expect(s.level).toBe(2); // עלה
  });

  it('2 שגויות רצופות מורידות רמה', () => {
    let s: ExerciseStats = { ...initialStats(), level: 8, peakLevel: 8 };
    s = applyAttempt(s, { correct: false, rtMs: 1000 });
    expect(s.level).toBe(8);
    s = applyAttempt(s, { correct: false, rtMs: 1000 });
    expect(s.level).toBe(7);
  });

  it('הרמה לעולם לא יורדת מתחת ל-70% מהשיא', () => {
    let s: ExerciseStats = { ...initialStats(), level: 10, peakLevel: 10 };
    const floor = floorFromPeak(10); // = 7
    // הרבה טעויות רצופות
    for (let i = 0; i < 30; i++) s = applyAttempt(s, { correct: false, rtMs: 800 });
    expect(s.level).toBeGreaterThanOrEqual(floor);
    expect(s.level).toBe(floor);
  });

  it('הרמה נשארת בטווח 1..15', () => {
    let s = initialStats();
    for (let i = 0; i < 100; i++) s = applyAttempt(s, { correct: true, rtMs: 500 });
    expect(s.level).toBeLessThanOrEqual(15);
    for (let i = 0; i < 100; i++) s = applyAttempt(s, { correct: false, rtMs: 500 });
    expect(s.level).toBeGreaterThanOrEqual(1);
  });

  it('מדדים מתעדכנים: דיוק, span, רצף מיטבי', () => {
    let s = initialStats();
    s = applyAttempt(s, { correct: true, rtMs: 900, span: 5 });
    s = applyAttempt(s, { correct: true, rtMs: 1100, span: 6 });
    expect(s.maxSpan).toBe(6);
    expect(s.bestStreak).toBeGreaterThanOrEqual(2);
    expect(s.medianRtMs).toBe(1000);
  });
});

describe('חזרות במרווחים', () => {
  const now = 1_000_000_000_000;
  const base = {
    id: 'x1',
    landId: 'echoes' as const,
    kind: 'delayed' as const,
    payload: { question: 'כמה?', answer: 'שלושה' },
  };

  it('פריט חדש מתוזמן ל-10 דקות קדימה', () => {
    const it = makeSpacedItem(base, now);
    expect(it.dueAt).toBe(now + SPACED_INTERVALS_MS[0]);
    expect(dueItems([it], now)).toHaveLength(0);
    expect(dueItems([it], now + SPACED_INTERVALS_MS[0])).toHaveLength(1);
  });

  it('הצלחה מקדמת מרווח; בסוף הסולם הפריט בוגר (null)', () => {
    let it: SpacedItem | null = makeSpacedItem(base, now);
    for (let i = 1; i < SPACED_INTERVALS_MS.length; i++) {
      it = advanceOnSuccess(it as SpacedItem, now);
      expect(it).not.toBeNull();
    }
    it = advanceOnSuccess(it as SpacedItem, now);
    expect(it).toBeNull();
  });

  it('כישלון מחזיר למרווח הקודם', () => {
    let it = makeSpacedItem(base, now);
    it = advanceOnSuccess(it, now)!;
    it = advanceOnSuccess(it, now)!; // idx 2
    const back = regressOnFailure(it, now);
    expect(back.intervalIdx).toBe(1);
  });
});

describe('בניית המסע היומי', () => {
  it('כולל את כל סוגי השלבים ומסתיים בסיום מובטח', () => {
    const session = buildDailySession({}, 20, true, Date.now());
    const kinds = session.steps.map((s) => s.kind);
    expect(kinds[0]).toBe('warmup');
    expect(kinds).toContain('connections-practice');
    expect(kinds).toContain('delayed-reveal');
    expect(kinds).toContain('yesterday');
    expect(kinds).toContain('rotation');
    expect(kinds).toContain('speed');
    expect(kinds).toContain('delayed-recall');
    expect(kinds[kinds.length - 1]).toBe('guaranteed-finish');
  });

  it('בלי חזרה מאתמול — אין שלב yesterday', () => {
    const session = buildDailySession({}, 20, false, Date.now());
    expect(session.steps.some((s) => s.kind === 'yesterday')).toBe(false);
  });

  it('אורך סשן משפיע על מספר סבבי הרוטציה', () => {
    const short = buildDailySession({}, 10, false, Date.now());
    const long = buildDailySession({}, 25, false, Date.now());
    const rot = (s: typeof short) => s.steps.filter((x) => x.kind === 'rotation').length;
    expect(rot(long)).toBeGreaterThan(rot(short));
  });

  it.each([10, 15, 20, 25])('כולל שני מקטעים מופרדים של 10 שאלות עיר ב-%i דקות', (minutes) => {
    const statCases: Record<string, ExerciseStats>[] = [
      {},
      {
        'connections.direct': {
          ...initialStats(),
          level: 12,
          peakLevel: 12,
          attempts: 90,
          correct: 84,
        },
        'numbers.forward': {
          ...initialStats(),
          attempts: 40,
          correct: 12,
        },
      },
      {
        'connections.direct': {
          ...initialStats(),
          attempts: 40,
          correct: 5,
        },
        'numbers.forward': {
          ...initialStats(),
          level: 10,
          peakLevel: 10,
          attempts: 40,
          correct: 38,
        },
      },
    ];

    for (const stats of statCases) {
      const session = buildDailySession(stats, minutes, false, Date.UTC(2026, 7, 28));
      const citySteps = session.steps.filter((step) => step.kind === 'connections-practice');
      expect(citySteps).toHaveLength(2);
      expect(citySteps.map((step) => step.rounds)).toEqual([10, 10]);
      expect(citySteps.every((step) => step.exerciseId === 'connections.direct')).toBe(true);

      const { activities } = buildActivities(session, [], 17);
      const cityIndexes = activities
        .map((activity, index) => activity.kind === 'game'
          && activity.exerciseId === 'connections.direct'
          && activity.landId === 'connections' ? index : -1)
        .filter((index) => index >= 0);
      expect(cityIndexes).toHaveLength(20);
      expect(cityIndexes.slice(0, 10)).toEqual(Array.from({ length: 10 }, (_, index) => cityIndexes[0] + index));
      expect(cityIndexes.slice(10)).toEqual(Array.from({ length: 10 }, (_, index) => cityIndexes[10] + index));
      expect(cityIndexes[10] - cityIndexes[9]).toBeGreaterThan(1);

      const rotations = session.steps.filter((step) => step.kind === 'rotation');
      expect(rotations).toHaveLength(minutes <= 10 ? 4 : minutes <= 15 ? 6 : minutes <= 20 ? 8 : 10);
      expect(rotations.every((step) => step.landId !== 'connections')).toBe(true);
      expect(session.steps.find((step) => step.kind === 'speed')?.landId).toBe('speed');
    }
  });

  it('שומר משחק חופשי קצר ומונע ניפוח שאלות עיר בהארכות המסע', () => {
    const freePlay = buildFreePlayActivities('connections');
    expect(freePlay).toHaveLength(FREE_PLAY_ACTIVITY_COUNT);
    expect(freePlay).toHaveLength(5);
    expect(freePlay.every((activity) => activity.kind === 'game' && activity.landId === 'connections')).toBe(true);

    for (let index = 0; index < 30; index += 1) {
      const extra = buildDailySupplementalActivity(index);
      expect(extra.kind).toBe('game');
      if (extra.kind === 'game') expect(extra.landId).not.toBe('connections');
    }
  });

  it('מפריד בין מספר שאלות העיר לבין מספר ההצלחות שבונות', () => {
    const cityQuestion = buildFreePlayActivities('connections')[0];
    const numbersQuestion = buildFreePlayActivities('numbers')[0];
    expect(cityQuestion.kind).toBe('game');
    expect(numbersQuestion.kind).toBe('game');
    if (cityQuestion.kind !== 'game' || numbersQuestion.kind !== 'game') return;

    expect(shouldAdvanceAfterCompletedIncorrect(cityQuestion, true)).toBe(true);
    expect(shouldAdvanceAfterCompletedIncorrect(cityQuestion, false)).toBe(false);
    expect(shouldAdvanceAfterCompletedIncorrect(numbersQuestion, true)).toBe(false);
  });
});
