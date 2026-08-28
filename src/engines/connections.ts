import type { Challenge, ExerciseEngine, GenerationContext } from '../types';
import {
  MULTIPLICATION_FACTS,
  connectionResult,
  factsAvailableAtLevel,
  preferredConnection,
  selectMultiplicationFact,
  type MultiplicationConnection,
  type MultiplicationFact,
} from '../learning/multiplicationFacts';
import { makeRng } from './rng';

export interface MultiplicationBaseStimulus {
  factId: string;
  a: number;
  b: number;
  displayA: number;
  displayB: number;
  answer: number;
  connection?: MultiplicationConnection;
}

export interface DerivedFactStimulus extends MultiplicationBaseStimulus {
  connection: MultiplicationConnection;
}

export interface FactLinkOption {
  factId: string;
  a: number;
  b: number;
  answer: number;
}

export interface FactLinkStimulus extends DerivedFactStimulus {
  options: FactLinkOption[];
}

function baseStimulus(fact: MultiplicationFact, flip: boolean): MultiplicationBaseStimulus {
  return {
    factId: fact.id,
    a: fact.a,
    b: fact.b,
    displayA: flip ? fact.b : fact.a,
    displayB: flip ? fact.a : fact.b,
    answer: fact.answer,
  };
}

function contextNow(context?: GenerationContext): number {
  // Tests and old callers stay deterministic even without a runtime clock context.
  return context?.now ?? 0;
}

export const connectionsDirect: ExerciseEngine<MultiplicationBaseStimulus, number> = {
  id: 'connections.direct',
  landId: 'connections',
  title: 'לבנת תשובה',
  parentDescription: 'שליפה ישירה של עובדות כפל, בלי לחץ זמן גלוי',
  generate(level, seed, context): Challenge<MultiplicationBaseStimulus, number> {
    const rng = makeRng(seed);
    const fact = selectMultiplicationFact(level, rng, context?.multiplication, contextNow(context));
    const stimulus = {
      ...baseStimulus(fact, rng.next() < 0.5),
      connection: preferredConnection(fact, context?.multiplication),
    };
    return {
      exerciseId: this.id,
      landId: 'connections',
      level,
      stimulus,
      answer: fact.answer,
      params: { factId: fact.id, challengeType: 'direct' },
      prompt: 'בנה את לבנת התשובה',
    };
  },
  check(challenge, given) {
    return given === challenge.answer;
  },
};

export const connectionsDerived: ExerciseEngine<DerivedFactStimulus, number> = {
  id: 'connections.derived',
  landId: 'connections',
  title: 'בונים מקשר מוכר',
  parentDescription: 'פתרון עובדת כפל בעזרת עובדה קשורה',
  generate(level, seed, context): Challenge<DerivedFactStimulus, number> {
    const rng = makeRng(seed);
    const fact = selectMultiplicationFact(level, rng, context?.multiplication, contextNow(context));
    const connection = preferredConnection(fact, context?.multiplication);
    const stimulus: DerivedFactStimulus = {
      ...baseStimulus(fact, rng.next() < 0.5),
      connection,
    };
    return {
      exerciseId: this.id,
      landId: 'connections',
      level,
      stimulus,
      answer: fact.answer,
      params: { factId: fact.id, challengeType: 'derived', connection: connection.kind },
      prompt: 'מצא דרך מעובדה שכבר מוכרת',
    };
  },
  check(challenge, given) {
    return given === challenge.answer && connectionResult(challenge.stimulus.connection) === challenge.answer;
  },
};

export const connectionsLink: ExerciseEngine<FactLinkStimulus, string> = {
  id: 'connections.link',
  landId: 'connections',
  title: 'מוצאים קשר',
  parentDescription: 'בחירת עובדה מועילה שממנה אפשר לגזור עובדת כפל חדשה',
  generate(level, seed, context): Challenge<FactLinkStimulus, string> {
    const rng = makeRng(seed);
    const fact = selectMultiplicationFact(
      level,
      rng,
      context?.multiplication,
      contextNow(context),
      { requireConnection: true },
    );
    const connection = preferredConnection(fact, context?.multiplication);
    const source = MULTIPLICATION_FACTS.find((candidate) => candidate.id === connection.sourceFactId)!;
    const distractors = rng.shuffle(
      factsAvailableAtLevel(level).filter((candidate) => candidate.id !== source.id && candidate.id !== fact.id),
    ).slice(0, 2);
    const options = rng.shuffle([source, ...distractors]).map(({ id, a, b, answer }) => ({ factId: id, a, b, answer }));
    const stimulus: FactLinkStimulus = {
      ...baseStimulus(fact, rng.next() < 0.5),
      connection,
      options,
    };
    return {
      exerciseId: this.id,
      landId: 'connections',
      level,
      stimulus,
      answer: source.id,
      params: { factId: fact.id, challengeType: 'link', connection: connection.kind },
      prompt: 'איזו עובדה יכולה לעזור לבנות את הדרך?',
    };
  },
  check(challenge, given) {
    return given === challenge.answer && challenge.stimulus.options.some((option) => option.factId === given);
  },
};

export const CONNECTIONS_ENGINES = [connectionsDirect, connectionsDerived, connectionsLink];
