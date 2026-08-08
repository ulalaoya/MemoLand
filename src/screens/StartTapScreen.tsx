/* מסך "הקש כדי להתחיל" — מאתחל את מנוע הקול וה-SFX מתוך מגע ראשון (חובה ב-iOS).
   מציג את תמונת ההירו של ממו לנד. */
import { unlockSpeech } from '../audio/speech';
import { unlockSfx } from '../audio/sfx';
import { Logo } from '../components/Logo';
import { OpeningAdventureScene } from '../components/opening/OpeningAdventureScene';
import '../components/opening/opening-screen.css';

export function StartTapScreen({ onStart, playerName }: { onStart: () => void; playerName?: string }) {
  function start() {
    unlockSpeech();
    unlockSfx();
    onStart();
  }

  return (
    <main className="ml-opening-screen">
      <OpeningAdventureScene />

      <div className="ml-opening-brand">
        <Logo variant="compact" width={264} />
      </div>

      <p className="ml-opening-welcome">{playerName ? `ברוך הבא, ${playerName}!` : 'ברוך הבא!'}</p>

      <div className="ml-opening-action">
        <button type="button" className="ml-opening-cta ml-pressable" onClick={start}>
          <span className="ml-opening-cta__icon" aria-hidden>▶</span>
          <span>הקש כדי להתחיל</span>
        </button>
        <p className="ml-opening-hint">ממו כבר מצא את הדרך. ההרפתקה מחכה לך!</p>
      </div>
    </main>
  );
}
