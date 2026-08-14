import { EchoSpeakerGlyph } from './EchoCaveChallenge';
import { EchoDiagnosticsPanel } from './EchoDiagnosticsPanel';
import './echo-audio.css';

export function EchoAudioState({ state, onRetry }: { state: 'playing' | 'error'; onRetry?: () => void }) {
  return (
    <div className={`ml-echo-audio ml-echo-audio--${state}`} role={state === 'error' ? 'alert' : 'status'}>
      <div className="ml-echo-audio__portal" aria-hidden>
        <span className="ml-echo-audio__speaker"><EchoSpeakerGlyph /></span>
        <span className="ml-echo-audio__wave ml-echo-audio__wave--one" />
        <span className="ml-echo-audio__wave ml-echo-audio__wave--two" />
        <span className="ml-echo-audio__wave ml-echo-audio__wave--three" />
      </div>
      {state === 'playing' ? (
        <div className="ml-echo-audio__copy">
          <strong>המערה מדברת...</strong>
          <p>עצור והקשב להד</p>
        </div>
      ) : (
        <div className="ml-echo-audio__error-copy">
          <strong>ההד לא יצא מהמערה</strong>
          <p>אפשר לנסות שוב. שום דבר לא אבד.</p>
          {onRetry ? (
            <button type="button" className="ml-echo-audio__retry ml-pressable" onClick={onRetry}>
              <span aria-hidden><EchoSpeakerGlyph /></span>
              נסו שוב
            </button>
          ) : null}
          <EchoDiagnosticsPanel />
        </div>
      )}
    </div>
  );
}
