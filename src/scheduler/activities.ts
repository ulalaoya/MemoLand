/* ממיר את מבנה הסשן לרשימת פעילויות קונקרטיות שהמסך מריץ. */
import type { DailySession, ExerciseId, JourneyActivity, LandId, SpacedItem } from '../types';
import { LANDS } from '../config/lands';
import { enginesForLand, playableLands } from '../engines';

export type Activity = JourneyActivity;

export interface BuiltActivities {
  activities: Activity[];
}

export const FREE_PLAY_ACTIVITY_COUNT = 5;
export const DAILY_CITY_QUESTION_COUNT = 15;

const NUMBER_RECALL_EXERCISES: ExerciseId[] = [
  'numbers.forward',
  'numbers.backward',
  'numbers.sort',
];

export function shouldAdvanceAfterCompletedIncorrect(
  activity: Extract<Activity, { kind: 'game' }>,
  completedIncorrect: boolean,
  requireSuccess = false,
): boolean {
  return completedIncorrect && activity.landId === 'connections' && !requireSuccess;
}

/** Free Play remains a short, land-focused sequence and does not inherit Daily Journey quotas. */
export function buildFreePlayActivities(landId: LandId): Activity[] {
  if (landId === 'connections') {
    return Array.from({ length: FREE_PLAY_ACTIVITY_COUNT }, () => ({
      kind: 'game' as const,
      exerciseId: 'connections.direct',
      landId,
      levelDelta: 0,
      label: LANDS.connections.name,
    }));
  }
  if (landId === 'speed') {
    return [{ kind: 'speed', landId: 'speed', seconds: 60, label: LANDS.speed.name }];
  }
  const exerciseIds = enginesForLand(landId).map((engine) => engine.id);
  return Array.from({ length: FREE_PLAY_ACTIVITY_COUNT }, (_, index) => ({
    kind: 'game' as const,
    exerciseId: exerciseIds[index % exerciseIds.length],
    landId,
    levelDelta: 0,
    label: LANDS[landId].name,
  }));
}

/** Goal-extension rounds deliberately exclude City; its 15-question puzzle quota is explicit above. */
export function buildDailySupplementalActivity(atIndex: number): Activity {
  const lands = playableLands().filter((land) => land !== 'connections' && land !== 'speed');
  const land = lands[atIndex % lands.length];
  const exerciseIds = enginesForLand(land).map((engine) => engine.id);
  return {
    kind: 'game',
    exerciseId: exerciseIds[atIndex % exerciseIds.length],
    landId: land,
    levelDelta: 0,
    label: 'הרפתקה',
  };
}

function isDailyCityActivity(activity: Activity): boolean {
  return activity.kind === 'game' && activity.landId === 'connections';
}

/**
 * Repairs plans saved by older releases without discarding completed work.
 * It caps City at one 15-question puzzle and groups all still-pending City
 * questions together, so an interrupted installed PWA cannot reopen a full
 * puzzle or award extra City rewards after piece 15.
 */
export function normalizeDailyCityPlan(
  plan: Activity[],
  currentActivity: number,
): { activities: Activity[]; currentActivity: number; changed: boolean } {
  const cursor = Math.max(0, Math.min(Math.floor(currentActivity), plan.length));
  let cityCount = 0;
  const retained = plan.map((activity, originalIndex) => {
    const keep = !isDailyCityActivity(activity) || ++cityCount <= DAILY_CITY_QUESTION_COUNT;
    return { activity, originalIndex, keep };
  }).filter((entry) => entry.keep);

  const completed = retained.filter((entry) => entry.originalIndex < cursor);
  const pending = retained.filter((entry) => entry.originalIndex >= cursor);
  const firstPendingCity = pending.findIndex((entry) => isDailyCityActivity(entry.activity));
  let normalizedPending = pending;

  if (firstPendingCity >= 0) {
    const city = pending.filter((entry) => isDailyCityActivity(entry.activity));
    const other = pending.filter((entry) => !isDailyCityActivity(entry.activity));
    const nonCityBefore = pending
      .slice(0, firstPendingCity)
      .filter((entry) => !isDailyCityActivity(entry.activity)).length;
    normalizedPending = [
      ...other.slice(0, nonCityBefore),
      ...city,
      ...other.slice(nonCityBefore),
    ];
  }

  const normalizedEntries = [...completed, ...normalizedPending];
  const activities = normalizedEntries.map((entry) => entry.activity);
  const changed = activities.length !== plan.length
    || normalizedEntries.some((entry, index) => entry.originalIndex !== index);

  return {
    activities,
    currentActivity: completed.length,
    changed,
  };
}

export function buildActivities(
  session: DailySession,
  dueSpaced: SpacedItem[],
  _seed: number,
): BuiltActivities {
  const activities: Activity[] = [];
  let dueIdx = 0;
  let numberRecallOffset = 0;
  let cityQuestionOffset = 0;
  const cityDifficultyBoosts = [0, 0, 5, 0, 2, 7, 0, 3, 0, 6, 0, 3, 8, 0, 5] as const;

  function variedExercise(exerciseId: ExerciseId, landId: LandId): ExerciseId {
    if (landId !== 'numbers') return exerciseId;
    const preferredIndex = NUMBER_RECALL_EXERCISES.indexOf(exerciseId);
    if (preferredIndex < 0) return exerciseId;
    const varied = NUMBER_RECALL_EXERCISES[(preferredIndex + numberRecallOffset) % NUMBER_RECALL_EXERCISES.length];
    numberRecallOffset += 1;
    return varied;
  }

  for (const step of session.steps) {
    switch (step.kind) {
      case 'warmup':
        for (let i = 0; i < step.rounds; i++)
          activities.push({
            kind: 'game',
            exerciseId: variedExercise(step.exerciseId!, step.landId!),
            landId: step.landId!,
            levelDelta: -2,
            label: step.label,
          });
        break;

      case 'connections-practice':
        for (let i = 0; i < step.rounds; i++) {
          activities.push({
            kind: 'game',
            exerciseId: 'connections.direct',
            landId: 'connections',
            // Even a new learner meets a few challenging facts in every puzzle,
            // while most questions remain adapted to the child's current level.
            levelDelta: cityDifficultyBoosts[cityQuestionOffset % cityDifficultyBoosts.length],
            label: step.label,
          });
          cityQuestionOffset += 1;
        }
        break;

      case 'yesterday': {
        const item = dueSpaced[dueIdx++];
        if (item) {
          activities.push({
            kind: 'quiz',
            landId: item.landId,
            label: step.label,
            question: item.payload.question,
            answer: item.payload.answer,
            options: item.payload.options ?? [item.payload.answer],
            spacedId: item.id,
          });
        }
        break;
      }

      case 'rotation':
        activities.push({
          kind: 'game',
          exerciseId: variedExercise(step.exerciseId!, step.landId!),
          landId: step.landId!,
          levelDelta: 0,
          label: step.label,
        });
        break;

      case 'speed':
        activities.push({ kind: 'speed', landId: step.landId!, seconds: step.timerSeconds ?? 60, label: step.label });
        break;

      case 'guaranteed-finish':
        for (let i = 0; i < step.rounds; i++)
          activities.push({
            kind: 'game',
            exerciseId: variedExercise(step.exerciseId!, step.landId!),
            landId: step.landId!,
            levelDelta: -3,
            label: step.label,
          });
        break;
    }
  }

  return { activities };
}
