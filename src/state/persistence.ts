/* =========================================================================
   שכבת שמירה מקומית (localStorage) — עם תמיכה בריבוי פרופילים.
   לכל פרופיל (ילד/משתמש) התקדמות נפרדת תחת מפתח משלו.
   הנתונים שורדים רענון וסגירת דפדפן, והאפליקציה נטענת ללא רשת.
   ========================================================================= */
import type { AvatarKind, LandId, Profile, ProfileRegistry, SaveState, Settings } from '../types';
import { LAND_ORDER } from '../config/lands';

const LEGACY_KEY = 'memoland.save.v1';
const REGISTRY_KEY = 'memoland.profiles.v1';
const savePrefix = (id: string) => `memoland.save.v1.${id}`;
export const SAVE_VERSION = 1;

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
    settings: defaultSettings(),
    parentContent: { wordLists: [], sentences: [], paragraphs: [] },
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
      if (reg && Array.isArray(reg.profiles)) return reg;
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
    const parsed = JSON.parse(raw) as SaveState;
    if (parsed.version !== SAVE_VERSION) return migrate(parsed);
    return { ...defaultSave(), ...parsed, settings: { ...defaultSettings(), ...parsed.settings } };
  } catch {
    return defaultSave();
  }
}

function migrate(old: Partial<SaveState>): SaveState {
  return { ...defaultSave(), ...old, settings: { ...defaultSettings(), ...old.settings }, version: SAVE_VERSION } as SaveState;
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
  const parsed = JSON.parse(text) as SaveState;
  if (typeof parsed !== 'object' || parsed === null) throw new Error('קובץ לא תקין');
  return { ...defaultSave(), ...parsed, settings: { ...defaultSettings(), ...parsed.settings }, version: SAVE_VERSION };
}
