/* =========================================================================
   הקראה קולית — SpeechSynthesis, עברית (he-IL).
   כל התרגול השמיעתי מוקרא בעברית. ב-iOS ההשמעה חייבת להיווצר מתוך מגע
   ראשון (מסך "הקש כדי להתחיל").
   ========================================================================= */

let unlocked = false;
/** הקול האוטומטי הטוב ביותר (עברי) שנמצא במכשיר. */
let autoHebrewVoice: SpeechSynthesisVoice | null = null;
/** שם קול שנבחר ידנית בהגדרות (גובר על האוטומטי). */
let preferredVoiceName: string | null = null;

export function isSpeechUnlocked(): boolean {
  return unlocked;
}

/** נקרא מתוך אירוע מגע/קליק כדי לפתוח את מנוע הקול ב-iOS. */
export function unlockSpeech(): void {
  if (unlocked || typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    window.speechSynthesis.speak(u);
    window.speechSynthesis.resume();
    unlocked = true;
    refreshVoices();
  } catch {
    /* מתעלמים — נמשיך גם בלי קול */
  }
}

/** כל הקולות בעברית הזמינים במכשיר. */
export function listHebrewVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang === 'he-IL' || v.lang?.toLowerCase().startsWith('he'));
}

/** האם קיים קול עברי במכשיר. */
export function hasHebrewVoice(): boolean {
  return listHebrewVoices().length > 0;
}

function refreshVoices(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const heb = listHebrewVoices();
  autoHebrewVoice = heb[0] ?? null;
}

/** קובע קול מועדף לפי שם (מתוך ההגדרות). null = אוטומטי. */
export function setPreferredVoiceName(name: string | null): void {
  preferredVoiceName = name;
}

/** הקול שישמש בפועל להקראה. */
function activeVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  if (preferredVoiceName) {
    const match = window.speechSynthesis.getVoices().find((v) => v.name === preferredVoiceName);
    if (match) return match;
  }
  return autoHebrewVoice;
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = refreshVoices;
  refreshVoices();
}

export interface SpeakOptions {
  rate?: number;
  onEnd?: () => void;
}

/** מקריא טקסט עברי. עוצר הקראה קודמת. */
export function speak(text: string, rate = 0.9, opts: SpeakOptions = {}): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    opts.onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'he-IL';
  u.rate = rate;
  u.pitch = 1.05;
  const voice = activeVoice();
  if (voice) u.voice = voice;
  if (opts.onEnd) u.onend = () => opts.onEnd!();
  window.speechSynthesis.speak(u);
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
}
