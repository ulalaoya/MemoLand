/* ממיר את מבנה הסשן לרשימת פעילויות קונקרטיות שהמסך מריץ. */
import type { DailySession, ExerciseId, JourneyActivity, LandId, SpacedItem } from '../types';
import { LANDS } from '../config/lands';
import { enginesForLand, playableLands } from '../engines';

export type Activity = JourneyActivity;

export interface BuiltActivities {
  activities: Activity[];
}

export const FREE_PLAY_ACTIVITY_COUNT = 5;

const NUMBER_RECALL_EXERCISES: ExerciseId[] = [
  'numbers.forward',
  'numbers.backward',
  'numbers.sort',
];

export function shouldAdvanceAfterCompletedIncorrect(
  activity: Extract<Activity, { kind: 'game' }>,
  completedIncorrect: boolean,
): boolean {
  return completedIncorrect && activity.landId === 'connections';
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

/** Goal-extension rounds deliberately exclude City; its 20-question quota is explicit above. */
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

export function buildActivities(
  session: DailySession,
  dueSpaced: SpacedItem[],
  _seed: number,
): BuiltActivities {
  const activities: Activity[] = [];
  let dueIdx = 0;
  let numberRecallOffset = 0;

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
            levelDelta: 0,
            label: step.label,
          });
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
