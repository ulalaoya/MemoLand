import { Button } from '../Button';
import './echo-audio.css';

export function EchoAudioState({ state, onRetry }: { state: 'playing' | 'error'; onRetry?: () => void }) {
  return (
    <div className={`ml-echo-audio ml-echo-audio--${state}`} role={state === 'error' ? 'alert' : 'status'}>
      <div className="ml-echo-audio__scene" aria-hidden>
        <span className="ml-echo-audio__memo">
          <img src="./characters/memo.png" alt="" draggable={false} />
        </span>
        <span className="ml-echo-audio__wave ml-echo-audio__wave--one" />
        <span className="ml-echo-audio__wave ml-echo-audio__wave--two" />
        <span className="ml-echo-audio__wave ml-echo-audio__wave--three" />
      </div>
      {state === 'playing' ? (
        <div>
          <strong>האוזניים מוכנות?</strong>
          <p>ממו שולח הד דרך המערה…</p>
        </div>
      ) : (
        <div className="ml-echo-audio__error-copy">
          <strong>ההד לא יצא מהמערה</strong>
          <p>אפשר לנסות שוב. שום דבר לא אבד.</p>
          {onRetry ? <Button variant="green" onClick={onRetry}>🔊 נסו שוב</Button> : null}
        </div>
      )}
    </div>
  );
}
