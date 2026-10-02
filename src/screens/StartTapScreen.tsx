/* מסך "הקש כדי להתחיל" — מאתחל את מנוע הקול וה-SFX מתוך מגע ראשון (חובה ב-iOS).
   מציג את תמונת ההירו של ממו לנד. */
import { unlockSpeech } from '../audio/speech';
import { unlockSfx } from '../audio/sfx';
import { Logo } from '../components/Logo';
import { OpeningAdventureScene } from '../components/opening/OpeningAdventureScene';
import '../components/opening/opening-screen.css';

export function StartTapScreen({ onStart }: { onStart: () => void }) {
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

      <p className="ml-opening-welcome"><span>✦</span> ההרפתקה מתחילה כאן <span>✦</span></p>

      <div className="ml-opening-action">
        <button type="button" className="ml-opening-cta ml-pressable" onClick={start}>
          <span className="ml-opening-cta__icon" aria-hidden>▶</span>
          <span>הקש כדי להתחיל</span>
        </button>
        <p className="ml-opening-hint">כל עולם שומר סוד חדש לזיכרון</p>
      </div>
    </main>
  );
}
