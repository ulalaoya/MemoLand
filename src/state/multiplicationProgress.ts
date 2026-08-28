import type {
  MultiplicationAttemptInput,
  MultiplicationAttemptRecord,
  MultiplicationFactProgress,
  MultiplicationProgress,
  MultiplicationStage,
} from '../types';

const MULTIPLICATION_INTERVALS_MS = [
  10 * 60 * 1000,
  24 * 60 * 60 * 1000,
  3 * 24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
];

export function defaultMultiplicationProgress(): MultiplicationProgress {
  return { facts: {}, recentAttempts: [] };
}

export function defaultMultiplicationFactProgress(factId: string): MultiplicationFactProgress {
  return {
    factId,
    stage: 'DISCOVERING',
    directAttempts: 0,
    directCorrect: 0,
    supportedAttempts: 0,
    supportedCorrect: 0,
    consecutiveDirectCorrect: 0,
    successfulDays: [],
    lastPracticedAt: null,
    dueAt: 0,
    intervalIndex: 0,
    recentRtMs: [],
    helpUses: 0,
    lastAnchorFactId: null,
  };
}

const STAGE_ORDER: MultiplicationStage[] = ['DISCOVERING', 'STRENGTHENING', 'FLUENT'];

function atLeast(current: MultiplicationStage, candidate: MultiplicationStage): MultiplicationStage {
  return STAGE_ORDER.indexOf(candidate) > STAGE_ORDER.indexOf(current) ? candidate : current;
}

function nextStage(fact: MultiplicationFactProgress): MultiplicationStage {
  const totalCorrect = fact.directCorrect + fact.supportedCorrect;
  let stage = fact.stage;
  if (fact.directCorrect >= 2 || totalCorrect >= 3) stage = atLeast(stage, 'STRENGTHENING');
  if (
    fact.directAttempts >= 6
    && fact.directCorrect >= 5
    && fact.consecutiveDirectCorrect >= 2
    && fact.successfulDays.length >= 2
  ) {
    stage = atLeast(stage, 'FLUENT');
  }
  return stage;
}

export function applyMultiplicationAttempts(
  progress: MultiplicationProgress,
  attempts: readonly MultiplicationAttemptInput[],
  fallbackNow = Date.now(),
): MultiplicationProgress {
  if (attempts.length === 0) return progress;
  const facts = { ...progress.facts };
  const records: MultiplicationAttemptRecord[] = [];

  for (const input of attempts) {
    const at = input.at ?? fallbackNow;
    const day = new Date(at).toISOString().slice(0, 10);
    const previous = facts[input.factId] ?? defaultMultiplicationFactProgress(input.factId);
    const direct = input.mode === 'direct' && input.helpLevelUsed === 0;
    const correctDirect = direct && input.correct;
    const successfulDays = correctDirect && !previous.successfulDays.includes(day)
      ? [...previous.successfulDays, day].slice(-12)
      : previous.successfulDays;
    const intervalIndex = input.correct && direct
      ? Math.min(MULTIPLICATION_INTERVALS_MS.length - 1, previous.intervalIndex + 1)
      : previous.intervalIndex;
    const dueInterval = input.correct && direct
      ? MULTIPLICATION_INTERVALS_MS[previous.intervalIndex]
      : MULTIPLICATION_INTERVALS_MS[0];

    const next: MultiplicationFactProgress = {
      ...previous,
      directAttempts: previous.directAttempts + (direct ? 1 : 0),
      directCorrect: previous.directCorrect + (correctDirect ? 1 : 0),
      supportedAttempts: previous.supportedAttempts + (direct ? 0 : 1),
      supportedCorrect: previous.supportedCorrect + (!direct && input.correct ? 1 : 0),
      consecutiveDirectCorrect: direct
        ? (input.correct ? previous.consecutiveDirectCorrect + 1 : 0)
        : previous.consecutiveDirectCorrect,
      successfulDays,
      lastPracticedAt: at,
      dueAt: at + dueInterval,
      intervalIndex,
      recentRtMs: [...previous.recentRtMs, Math.max(0, Math.round(input.responseTimeMs))].slice(-8),
      helpUses: previous.helpUses + (input.helpLevelUsed > 0 ? 1 : 0),
      lastAnchorFactId: input.anchorFactId ?? previous.lastAnchorFactId,
    };
    next.stage = nextStage(next);
    facts[input.factId] = next;
    records.push({ ...input, at });
  }

  return {
    facts,
    recentAttempts: [...progress.recentAttempts, ...records].slice(-200),
  };
}

export function normalizeMultiplicationProgress(value: unknown): MultiplicationProgress {
  if (!value || typeof value !== 'object') return defaultMultiplicationProgress();
  const source = value as Partial<MultiplicationProgress>;
  const facts: MultiplicationProgress['facts'] = {};
  if (source.facts && typeof source.facts === 'object') {
    for (const [factId, raw] of Object.entries(source.facts)) {
      if (!raw || typeof raw !== 'object') continue;
      facts[factId] = { ...defaultMultiplicationFactProgress(factId), ...raw, factId };
    }
  }
  return {
    facts,
    recentAttempts: Array.isArray(source.recentAttempts) ? source.recentAttempts.slice(-200) : [],
  };
}
