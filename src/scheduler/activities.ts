/* ממיר את מבנה הסשן (7 שלבים) לרשימת פעילויות קונקרטיות שהמסך מריץ. */
import type { DailySession, LandId, SpacedItem } from '../types';
import { STORIES } from '../engines/echoesContent';
import { makeRng } from '../engines/rng';

export type Activity =
  | { kind: 'game'; exerciseId: string; landId: LandId; levelDelta: number; label: string }
  | { kind: 'reveal'; storyId: string; text: string; label: string }
  | { kind: 'quiz'; landId: LandId; label: string; question: string; answer: string; options: string[]; spacedId?: string }
  | { kind: 'speed'; landId: LandId; seconds: number; label: string };

export interface BuiltActivities {
  activities: Activity[];
  /** הסיפור שנחשף (למעקב שליפה מושהית). */
  revealStoryId: string;
}

export function buildActivities(
  session: DailySession,
  dueSpaced: SpacedItem[],
  seed: number,
): BuiltActivities {
  const rng = makeRng(seed);
  const story = rng.pick(STORIES);
  const activities: Activity[] = [];
  let dueIdx = 0;

  for (const step of session.steps) {
    switch (step.kind) {
      case 'warmup':
        for (let i = 0; i < step.rounds; i++)
          activities.push({ kind: 'game', exerciseId: step.exerciseId!, landId: step.landId!, levelDelta: -2, label: step.label });
        break;

      case 'delayed-reveal':
        activities.push({ kind: 'reveal', storyId: story.id, text: story.text, label: step.label });
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
        activities.push({ kind: 'game', exerciseId: step.exerciseId!, landId: step.landId!, levelDelta: 0, label: step.label });
        break;

      case 'speed':
        activities.push({ kind: 'speed', landId: step.landId!, seconds: step.timerSeconds ?? 60, label: step.label });
        break;

      case 'delayed-recall':
        // שאלה אחת (או שתיים) על הסיפור שנחשף
        for (const q of story.questions.slice(0, 2)) {
          activities.push({ kind: 'quiz', landId: 'echoes', label: step.label, question: q.q, answer: q.answer, options: q.options });
        }
        break;

      case 'guaranteed-finish':
        for (let i = 0; i < step.rounds; i++)
          activities.push({ kind: 'game', exerciseId: step.exerciseId!, landId: step.landId!, levelDelta: -3, label: step.label });
        break;
    }
  }

  return { activities, revealStoryId: story.id };
}
