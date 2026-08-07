/* מסך "הקש כדי להתחיל" — מאתחל את מנוע הקול וה-SFX מתוך מגע ראשון (חובה ב-iOS).
   מציג את תמונת ההירו של ממו לנד. */
import { unlockSpeech } from '../audio/speech';
import { unlockSfx } from '../audio/sfx';
import { Button } from '../components/Button';

export function StartTapScreen({ onStart }: { onStart: () => void }) {
  function start() {
    unlockSpeech();
    unlockSfx();
    onStart();
  }
  return (
    <div
      onClick={start}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 26,
        background: 'linear-gradient(#67C8FF, #2FA6F6)',
        paddingTop: 'var(--safe-top)',
        cursor: 'pointer',
        textAlign: 'center',
        padding: '24px 18px',
      }}
    >
      {/* תמונת ההירו — כוללת את הלוגו והדמות */}
      <img
        src="./hero.png"
        alt="MemoLand — עולם של זיכרון, כל יום"
        style={{
          width: '100%',
          maxWidth: 460,
          borderRadius: 20,
          border: '4px solid #fff',
          boxShadow: '0 8px 0 rgba(36,50,71,.3)',
        }}
      />

      <Button variant="green" size="lg" icon="▶" onClick={start} style={{ animation: 'memo-bounce 1.6s ease-in-out infinite' }}>
        הקש כדי להתחיל
      </Button>
      <p style={{ color: '#fff', fontWeight: 700, fontSize: 18, textShadow: '0 1px 3px rgba(36,50,71,.5)' }}>
        ממו מחכה לך במסע!
      </p>
    </div>
  );
}
