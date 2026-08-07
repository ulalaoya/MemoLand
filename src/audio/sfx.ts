/* =========================================================================
   אפקטים קוליים בסינתזה (Web Audio API) — בלי קבצים חיצוניים.
   מטבע, עלייה בשלב, הצלחה, רמז. נפתח מתוך מגע ראשון יחד עם הקול.
   ========================================================================= */

let ctx: AudioContext | null = null;
let enabled = true;

export function setSfxEnabled(on: boolean): void {
  enabled = on;
}

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/** נקרא מאירוע מגע ראשון. */
export function unlockSfx(): void {
  ensureCtx();
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.2): void {
  const c = ctx;
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + start);
  g.gain.setValueAtTime(0.0001, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + dur + 0.02);
}

function play(fn: () => void): void {
  if (!enabled) return;
  if (!ensureCtx()) return;
  fn();
}

/** מטבע — צליל קצר עולה. */
export function sfxCoin(): void {
  play(() => {
    tone(880, 0, 0.08, 'square', 0.15);
    tone(1320, 0.06, 0.1, 'square', 0.15);
  });
}

/** הצלחה — אקורד עולה קצר. */
export function sfxCorrect(): void {
  play(() => {
    tone(523, 0, 0.12, 'triangle', 0.18);
    tone(659, 0.1, 0.12, 'triangle', 0.18);
    tone(784, 0.2, 0.18, 'triangle', 0.18);
  });
}

/** עלייה בשלב — סולם עולה. */
export function sfxLevelUp(): void {
  play(() => {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.14, 'square', 0.16));
  });
}

/** רמז/כמעט — צליל רך ניטרלי (לעולם לא "באזר" של טעות). */
export function sfxSoft(): void {
  play(() => {
    tone(392, 0, 0.14, 'sine', 0.14);
    tone(440, 0.1, 0.16, 'sine', 0.14);
  });
}

/** חגיגה — זיקוקים קצרים. */
export function sfxFanfare(): void {
  play(() => {
    [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, i * 0.08, 0.2, 'triangle', 0.16));
  });
}
