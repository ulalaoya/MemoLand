import type { Challenge, ExerciseEngine, GenerationContext } from '../types';

/** Fingerprints content, not answer-button order, so reshuffling does not count as variety. */
export function challengeFingerprint(challenge: Challenge): string {
  const stimulus = challenge.stimulus as Record<string, unknown>;
  let content: unknown = stimulus;

  if (challenge.exerciseId === 'echoes.repeat') content = challenge.prompt;
  else if (challenge.exerciseId.startsWith('numbers.')) content = stimulus.digits ?? [stimulus.start, stimulus.steps];
  else if (challenge.exerciseId.startsWith('connections.')) content = stimulus.factId;
  else if (challenge.exerciseId === 'forest.grid') content = [stimulus.grid, stimulus.cells];
  else if (challenge.exerciseId === 'patterns.complete') content = stimulus.sequence;
  else if (challenge.exerciseId === 'speed.match') content = [stimulus.target, stimulus.options];
  else if (challenge.exerciseId === 'castle.memorize') content = stimulus.items;

  return `${challenge.exerciseId}:${JSON.stringify(content)}`;
}

/**
 * Deterministically probes nearby seeds and avoids the last three contents when an
 * alternative exists. If a finite pool is exhausted, the least-recent item wins.
 */
export function generateVariedChallenge<TStimulus, TAnswer>(
  engine: ExerciseEngine<TStimulus, TAnswer>,
  level: number,
  seed: number,
  recentFingerprints: readonly string[],
  context?: GenerationContext,
): Challenge<TStimulus, TAnswer> {
  const recent = recentFingerprints.slice(-3);
  const candidates = new Map<string, Challenge<TStimulus, TAnswer>>();

  for (let offset = 0; offset < 24; offset += 1) {
    const challenge = engine.generate(level, seed + offset, context);
    const fingerprint = challengeFingerprint(challenge);
    if (!candidates.has(fingerprint)) candidates.set(fingerprint, challenge);
    if (!recent.includes(fingerprint)) return challenge;
  }

  let fallback: Challenge<TStimulus, TAnswer> | undefined;
  let oldestPosition = Number.POSITIVE_INFINITY;
  for (const [fingerprint, challenge] of candidates) {
    const position = recent.indexOf(fingerprint);
    if (position < oldestPosition) {
      oldestPosition = position;
      fallback = challenge;
    }
  }
  return fallback ?? engine.generate(level, seed, context);
}
