/* =========================================================================
   שכבת שמירה מקומית (localStorage) — עם תמיכה בריבוי פרופילים.
   לכל פרופיל (ילד/משתמש) התקדמות נפרדת תחת מפתח משלו.
   הנתונים שורדים רענון וסגירת דפדפן, והאפליקציה נטענת ללא רשת.
   ========================================================================= */
import type { AvatarKind, JourneySecret, LandId, Profile, ProfileRegistry, SaveState, Settings } from '../types';
import { LAND_ORDER } from '../config/lands';
import { defaultMultiplicationProgress, normalizeMultiplicationProgress } from './multiplicationProgress';
import { normalizeCityGrowthMilestones } from './cityGrowth';

const LEGACY_KEY = 'memoland.save.v1';
const REGISTRY_KEY = 'memoland.profiles.v1';
const savePrefix = (id: string) => `memoland.save.v1.${id}`;
export const SAVE_VERSION = 6;
const NUMBER_RECALL_EXERCISES = ['numbers.forward', 'numbers.backward', 'numbers.sort'] as const;

function emptyDailyJourney(): SaveState['dailyJourney'] {
  return {
    day: null,
    status: 'not-started',
    currentActivity: 0,
    seed: 0,
    earnedPoints: 0,
    plan: [],
    secret: null,
  };
}

function normalizeJourneySecret(value: unknown): JourneySecret | null {
  if (!value || typeof value !== 'object') return null;
  const secret = value as Partial<JourneySecret>;
  const options = Array.isArray(secret.options)
    ? secret.options.filter((option): option is string => typeof option === 'string')
    : [];
  if ((secret.kind !== 'word' && secret.kind !== 'number')
    || typeof secret.value !== 'string'
    || options.length !== 3
    || new Set(options).size !== 3
    || !options.includes(secret.value)) return null;
  return {
    kind: secret.kind,
    value: secret.value,
    options: options as [string, string, string],
    revealed: secret.revealed === true,
    recallStarted: secret.recallStarted === true,
    answered: secret.answered === true,
    wasCorrect: typeof secret.wasCorrect === 'boolean' ? secret.wasCorrect : null,
    rewardClaimed: secret.rewardClaimed === true,
  };
}

function normalizeJourneyPlan(plan: unknown[], currentActivity: number) {
  let removedBeforeCurrent = 0;
  const filtered = plan.filter((activity, index) => {
    const item = activity && typeof activity === 'object'
      ? activity as { kind?: unknown; label?: unknown }
      : null;
    const isLegacyStory = item?.kind === 'reveal'
      || (item?.kind === 'quiz' && item.label === 'זוכר את הסוד?');
    if (isLegacyStory && index < currentActivity) removedBeforeCurrent += 1;
    return !isLegacyStory;
  }) as SaveState['dailyJourney']['plan'];
  let firstNumberMode = -1;
  let numberActivityOffset = 0;
  const varied = filtered.map((activity) => {
    if (activity.kind !== 'game' || activity.landId !== 'numbers') return activity;
    const currentMode = NUMBER_RECALL_EXERCISES.findIndex((exerciseId) => exerciseId === activity.exerciseId);
    if (currentMode < 0) return activity;
    if (firstNumberMode < 0) firstNumberMode = currentMode;
    const exerciseId = NUMBER_RECALL_EXERCISES[
      (firstNumberMode + numberActivityOffset) % NUMBER_RECALL_EXERCISES.length
    ];
    numberActivityOffset += 1;
    return activity.exerciseId === exerciseId ? activity : { ...activity, exerciseId };
  });
  const withCarCity = varied.length > 0 && !varied.some((activity) => activity.landId === 'cars')
    ? [...varied, {
        kind: 'game' as const,
        exerciseId: 'cars.plates',
        landId: 'cars' as const,
        levelDelta: 0,
        label: 'עצירה בעיר המכוניות',
      }]
    : varied;
  return {
    plan: withCarCity,
    currentActivity: Math.max(0, currentActivity - removedBeforeCurrent),
  };
}

function withoutLegacyStoryItems(value: unknown): SaveState['spaced'] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is SaveState['spaced'][number] => {
    if (!item || typeof item !== 'object') return false;
    const spaced = item as Partial<SaveState['spaced'][number]>;
    return !(spaced.kind === 'delayed'
      && typeof spaced.id === 'string'
      && spaced.id.startsWith('story-'));
  });
}

export function defaultSettings(): Settings {
  return {
    sessionMinutes: 20,
    speechRate: 0.9,
    soundEffects: true,
    reminderHour: null,
    parentConfirmsPhysical: true,
    parentPin: '1234',
    voiceName: null,
  };
}

export function defaultSave(): SaveState {
  const lands = {} as SaveState['lands'];
  for (const id of LAND_ORDER) {
    lands[id] = {
      landId: id as LandId,
      unlockedTracks: 1,
      completedTracks: 0,
      castleOpen: false,
    };
  }
  return {
    version: SAVE_VERSION,
    coins: 0,
    cityGrowthMilestones: 0,
    rank: 'beginner',
    stats: {},
    lands,
    spaced: [],
    medals: [],
    cosmetics: [],
    equipped: {},
    streakDays: 0,
    lastPlayedDay: null,
    streakShieldAvailable: true,
    todayPoints: 0,
    todayPointsDay: null,
    dailyJourney: emptyDailyJourney(),
    recentChallengeFingerprints: [],
    settings: defaultSettings(),
    parentContent: { wordLists: [], sentences: [], paragraphs: [] },
    multiplication: defaultMultiplicationProgress(),
    history: [],
  };
}

/* ----------------------------- פרופילים ----------------------------- */

function makeId(): string {
  return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** טוען את מרשם הפרופילים. מהגר שמירה ישנה (חד-פרופיל) לפרופיל ראשון. */
export function loadRegistry(): ProfileRegistry {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (raw) {
      const reg = JSON.parse(raw) as ProfileRegistry;
      if (reg && Array.isArray(reg.profiles)) {
        const activeId = reg.profiles.some((profile) => profile.id === reg.activeId)
          ? reg.activeId
          : null;
        return { ...reg, activeId };
      }
    }
  } catch {
    /* מתעלמים */
  }
  // הגירה: אם קיימת שמירה ישנה ללא פרופיל — עוטפים אותה בפרופיל "השחקן שלי".
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy) {
    const id = makeId();
    localStorage.setItem(savePrefix(id), legacy);
    localStorage.removeItem(LEGACY_KEY);
    const reg: ProfileRegistry = {
      activeId: null,
      profiles: [{ id, name: 'השחקן שלי', avatar: 'memo', createdAt: Date.now() }],
    };
    saveRegistry(reg);
    return reg;
  }
  return { activeId: null, profiles: [] };
}

export function saveRegistry(reg: ProfileRegistry): void {
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(reg));
  } catch {
    /* מתעלמים */
  }
}

export function createProfileEntry(name: string, avatar: AvatarKind): Profile {
  return { id: makeId(), name: name.trim() || 'שחקן', avatar, createdAt: Date.now() };
}

/* ------------------------- שמירה לפי פרופיל ------------------------- */

/** טוען מצב שמור לפרופיל, או ברירת מחדל. עמיד בפני JSON פגום. */
export function loadSaveFor(profileId: string): SaveState {
  try {
    const raw = localStorage.getItem(savePrefix(profileId));
    if (!raw) return defaultSave();
    return normalizeSave(JSON.parse(raw));
  } catch {
    return defaultSave();
  }
}

/**
 * ממיר שמירות מגרסאות קודמות ושמירות חלקיות למבנה המלא הנוכחי. מפת הארצות נבנית
 * מחדש לפי המרשם הנוכחי כדי להוסיף ארץ בלי למחוק התקדמות קיימת.
 */
export function normalizeSave(value: unknown): SaveState {
  const defaults = defaultSave();
  if (!value || typeof value !== 'object') return defaults;
  const source = value as Partial<SaveState>;
  const sourceLands = source.lands as Partial<SaveState['lands']> | undefined;
  const lands = {} as SaveState['lands'];
  for (const id of LAND_ORDER) {
    lands[id] = {
      ...defaults.lands[id],
      ...(sourceLands?.[id] ?? {}),
      landId: id as LandId,
    };
  }

  const sourceJourney = source.dailyJourney;
  const inferredJourney = !sourceJourney && source.lastPlayedDay
    ? {
        ...emptyDailyJourney(),
        day: source.lastPlayedDay,
        status: 'completed' as const,
      }
    : emptyDailyJourney();
  const rawJourneyPlan = Array.isArray(sourceJourney?.plan) ? sourceJourney.plan : inferredJourney.plan;
  const rawCurrentActivity = Number.isFinite(sourceJourney?.currentActivity)
    ? Math.max(0, Math.floor(sourceJourney!.currentActivity))
    : inferredJourney.currentActivity;
  const normalizedJourneyPlan = normalizeJourneyPlan(rawJourneyPlan, rawCurrentActivity);

  return {
    ...defaults,
    ...source,
    version: SAVE_VERSION,
    lands,
    settings: { ...defaultSettings(), ...(source.settings ?? {}) },
    parentContent: { ...defaults.parentContent, ...(source.parentContent ?? {}) },
    spaced: withoutLegacyStoryItems(source.spaced),
    dailyJourney: {
      ...inferredJourney,
      ...(sourceJourney ?? {}),
      ...normalizedJourneyPlan,
      secret: normalizeJourneySecret(sourceJourney?.secret),
    },
    recentChallengeFingerprints: Array.isArray(source.recentChallengeFingerprints)
      ? source.recentChallengeFingerprints.filter((item): item is string => typeof item === 'string').slice(-3)
      : [],
    multiplication: normalizeMultiplicationProgress(source.multiplication),
    cityGrowthMilestones: normalizeCityGrowthMilestones(source.cityGrowthMilestones),
  };
}

const saveTimers: Record<string, ReturnType<typeof setTimeout>> = {};

/** שמירה עם debounce קצר, לפי פרופיל. */
export function persistFor(profileId: string, state: SaveState): void {
  if (saveTimers[profileId]) clearTimeout(saveTimers[profileId]);
  saveTimers[profileId] = setTimeout(() => {
    try {
      localStorage.setItem(savePrefix(profileId), JSON.stringify(state));
    } catch {
      /* אחסון מלא — מתעלמים */
    }
  }, 200);
}

/** Flushes the latest state synchronously before the browser/PWA is suspended. */
export function persistImmediatelyFor(profileId: string, state: SaveState): void {
  if (saveTimers[profileId]) clearTimeout(saveTimers[profileId]);
  try {
    localStorage.setItem(savePrefix(profileId), JSON.stringify(state));
  } catch {
    /* אחסון מלא — מתעלמים */
  }
}

/** מוחק את השמירה של פרופיל (מחיקת פרופיל). */
export function deleteSaveFor(profileId: string): void {
  localStorage.removeItem(savePrefix(profileId));
}

/** מאפס את השמירה של פרופיל להתקדמות ריקה. */
export function resetSaveFor(profileId: string): void {
  localStorage.setItem(savePrefix(profileId), JSON.stringify(defaultSave()));
}

/* ----------------------------- ייצוא/ייבוא ----------------------------- */

export function exportSave(state: SaveState): string {
  return JSON.stringify(state, null, 2);
}

export function importSave(text: string): SaveState {
  const parsed = JSON.parse(text) as unknown;
  if (typeof parsed !== 'object' || parsed === null) throw new Error('קובץ לא תקין');
  return normalizeSave(parsed);
}
