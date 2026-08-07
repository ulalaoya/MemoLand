/* =========================================================================
   Store התקדמות — מצב יחיד, פעולות טהורות, שמירה אוטומטית.
   נחשף ל-React דרך useSyncExternalStore (ראה useStore).
   ========================================================================= */
import { useSyncExternalStore } from 'react';
import type {
  AvatarKind,
  CosmeticItem,
  ExerciseId,
  LandId,
  Medal,
  Profile,
  ProfileRegistry,
  SaveState,
  Settings,
  SpacedItem,
} from '../types';
import {
  createProfileEntry,
  defaultSave,
  deleteSaveFor,
  loadRegistry,
  loadSaveFor,
  persistFor,
  resetSaveFor,
  saveRegistry,
} from './persistence';
import { applyAttempt, initialStats } from '../scheduler/leveling';
import { coinsForCorrect, newlyEarnedMedals, rankForCoins } from './rewards';
import { TRACKS_PER_LAND } from '../config/lands';

let registry: ProfileRegistry = loadRegistry();
let activeId: string | null = registry.activeId;
let state: SaveState = activeId ? loadSaveFor(activeId) : defaultSave();
const listeners = new Set<() => void>();

function emit(): void {
  if (activeId) persistFor(activeId, state);
  listeners.forEach((l) => l());
}

function set(next: SaveState): void {
  state = next;
  emit();
}

export function getState(): SaveState {
  return state;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Hook ראשי: בורר חלק מהמצב (עם השוואה רדודה דרך getSnapshot). */
export function useStore<T>(selector: (s: SaveState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

/* ------------------------------ פרופילים ------------------------------ */

export function getRegistry(): ProfileRegistry {
  return registry;
}

export function getActiveProfileId(): string | null {
  return activeId;
}

export function getActiveProfile(): Profile | null {
  return registry.profiles.find((p) => p.id === activeId) ?? null;
}

/** Hook לפרופילים — נגזר מאותו מנגנון subscribe. */
export function useProfiles<T>(selector: (r: ProfileRegistry) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(registry),
    () => selector(registry),
  );
}

/** בוחר פרופיל פעיל וטוען את השמירה שלו. */
export function selectProfile(id: string): void {
  activeId = id;
  registry = { ...registry, activeId: id };
  saveRegistry(registry);
  state = loadSaveFor(id);
  emit();
}

/** יוצר פרופיל חדש ובוחר אותו. */
export function createProfile(name: string, avatar: AvatarKind): Profile {
  const p = createProfileEntry(name, avatar);
  registry = { activeId: p.id, profiles: [...registry.profiles, p] };
  saveRegistry(registry);
  activeId = p.id;
  state = defaultSave();
  persistFor(p.id, state);
  emit();
  return p;
}

/** מוחק פרופיל ואת השמירה שלו. */
export function deleteProfile(id: string): void {
  deleteSaveFor(id);
  const profiles = registry.profiles.filter((p) => p.id !== id);
  const nextActive = activeId === id ? null : activeId;
  registry = { activeId: nextActive, profiles };
  saveRegistry(registry);
  activeId = nextActive;
  state = activeId ? loadSaveFor(activeId) : defaultSave();
  emit();
}

/** יוצא מהפרופיל הפעיל (חוזרים למסך בחירת המשתמש). */
export function logoutProfile(): void {
  activeId = null;
  registry = { ...registry, activeId: null };
  saveRegistry(registry);
  emit();
}

/** מאפס את ההתקדמות של הפרופיל הפעיל. */
export function resetActiveProfile(): void {
  if (!activeId) return;
  resetSaveFor(activeId);
  state = loadSaveFor(activeId);
  emit();
}

/** תאריך היום כ-YYYY-MM-DD. */
function todayKey(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

/* ------------------------------ פעולות ------------------------------ */

export interface RecordAttemptInput {
  exerciseId: ExerciseId;
  landId: LandId;
  correct: boolean;
  rtMs: number;
  span?: number;
}

export interface RecordAttemptResult {
  coinsGained: number;
  leveledUp: boolean;
  newMedals: Medal[];
}

/** מתעד ניסיון: מעדכן מדדים, רמה, מטבעות, מדליות והיסטוריה. */
export function recordAttempt(input: RecordAttemptInput): RecordAttemptResult {
  const prevStats = state.stats[input.exerciseId] ?? initialStats();
  const nextStats = applyAttempt(prevStats, {
    correct: input.correct,
    rtMs: input.rtMs,
    span: input.span,
  });
  const leveledUp = nextStats.level > prevStats.level;

  let coinsGained = 0;
  if (input.correct) {
    coinsGained = coinsForCorrect(nextStats.bestStreak, input.rtMs);
  }

  // היסטוריה יומית
  const day = todayKey();
  const history = [...state.history];
  let rec = history.find((h) => h.day === day);
  if (!rec) {
    rec = { day, minutes: 0, perLand: {} };
    history.push(rec);
  }
  const pl = rec.perLand[input.landId] ?? { attempts: 0, correct: 0 };
  pl.attempts += 1;
  if (input.correct) pl.correct += 1;
  rec.perLand[input.landId] = pl;

  let next: SaveState = {
    ...state,
    stats: { ...state.stats, [input.exerciseId]: nextStats },
    coins: state.coins + coinsGained,
    history: history.slice(-90), // 90 ימים אחרונים
  };
  next.rank = rankForCoins(next.coins);

  const newMedals = newlyEarnedMedals(next, Date.now());
  if (newMedals.length) next = { ...next, medals: [...next.medals, ...newMedals] };

  set(next);
  return { coinsGained, leveledUp, newMedals };
}

/** מוסיף דקות תרגול ליום הנוכחי. */
export function addMinutes(minutes: number): void {
  const day = todayKey();
  const history = [...state.history];
  let rec = history.find((h) => h.day === day);
  if (!rec) {
    rec = { day, minutes: 0, perLand: {} };
    history.push(rec);
  }
  rec.minutes += minutes;
  set({ ...state, history: history.slice(-90) });
}

/** הנפת דגל במסלול והתקדמות בארץ; פותח טירה בסיום. */
export function completeTrack(landId: LandId): { castleOpened: boolean } {
  const land = state.lands[landId];
  const completedTracks = Math.min(TRACKS_PER_LAND, land.completedTracks + 1);
  const unlockedTracks = Math.min(TRACKS_PER_LAND, Math.max(land.unlockedTracks, completedTracks + 1));
  const castleOpen = completedTracks >= TRACKS_PER_LAND;
  set({
    ...state,
    lands: {
      ...state.lands,
      [landId]: { ...land, completedTracks, unlockedTracks, castleOpen },
    },
  });
  return { castleOpened: castleOpen && !land.castleOpen };
}

/** מסיים את המסע היומי: מעדכן רצף ימים ומגן רצף. */
export function finishDailyJourney(): { streakDays: number } {
  const day = todayKey();
  if (state.lastPlayedDay === day) return { streakDays: state.streakDays };

  const yesterday = todayKey(Date.now() - 24 * 60 * 60 * 1000);
  let streakDays = state.streakDays;
  let shield = state.streakShieldAvailable;

  if (state.lastPlayedDay === yesterday || state.lastPlayedDay === null) {
    streakDays += 1;
  } else if (shield) {
    // מגן רצף סופג יום שהוחמץ
    streakDays += 1;
    shield = false;
  } else {
    streakDays = 1;
  }

  set({
    ...state,
    streakDays,
    lastPlayedDay: day,
    streakShieldAvailable: shield,
  });
  return { streakDays };
}

/** מוסיף פריטי חזרה במרווחים. */
export function addSpacedItems(items: SpacedItem[]): void {
  set({ ...state, spaced: [...state.spaced, ...items] });
}

export function replaceSpaced(items: SpacedItem[]): void {
  set({ ...state, spaced: items });
}

/** מוסיף קישוט לחנות (מתיבת האוצר). */
export function addCosmetic(item: CosmeticItem): void {
  if (state.cosmetics.some((c) => c.id === item.id)) return;
  set({ ...state, cosmetics: [...state.cosmetics, item] });
}

export function equipCosmetic(kind: 'hat' | 'background', id: string): void {
  set({ ...state, equipped: { ...state.equipped, [kind]: id } });
}

export function addCoins(n: number): void {
  const coins = state.coins + n;
  set({ ...state, coins, rank: rankForCoins(coins) });
}

export function updateSettings(patch: Partial<Settings>): void {
  set({ ...state, settings: { ...state.settings, ...patch } });
}

export function setParentContent(content: SaveState['parentContent']): void {
  set({ ...state, parentContent: content });
}

export function replaceState(next: SaveState): void {
  set(next);
}
