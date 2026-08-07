/* בוחר את רכיב המשחק לפי exerciseId ומעביר לו את האתגר. */
import type { Challenge } from '../../types';
import type { GameResult } from './common';
import { DigitSpanGame } from './DigitSpanGame';
import { ChainMathGame } from './ChainMathGame';
import { ListenRepeatGame } from './ListenRepeatGame';
import { MultiStepGame } from './MultiStepGame';

export function GameHost({
  challenge,
  color,
  speechRate,
  hintMode,
  onResult,
}: {
  challenge: Challenge;
  color: string;
  speechRate: number;
  hintMode: boolean;
  onResult: (r: GameResult) => void;
}) {
  const p = { color, speechRate, hintMode, onResult };
  switch (challenge.exerciseId) {
    case 'numbers.forward':
    case 'numbers.backward':
    case 'numbers.sort':
      return <DigitSpanGame {...p} challenge={challenge as never} />;
    case 'numbers.chain':
      return <ChainMathGame {...p} challenge={challenge as never} />;
    case 'echoes.repeat':
      return <ListenRepeatGame {...p} challenge={challenge as never} />;
    case 'echoes.multistep':
      return <MultiStepGame {...p} challenge={challenge as never} />;
    default:
      return <div style={{ padding: 20 }}>האתגר הזה עוד בבנייה 🚧</div>;
  }
}
