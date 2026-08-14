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
/** Keep utterances alive until the browser reports completion. Some Chromium builds can
 * garbage-collect an unreferenced utterance before its callbacks fire. */
const activeUtterances = new Set<SpeechSynthesisUtterance>();
const diagnosticEvents: { at: string; event: string; detail?: string }[] = [];
export const SPEECH_START_WATCHDOG_MS = 8000;

function recordDiagnostic(event: string, detail?: string): void {
  diagnosticEvents.push({ at: new Date().toISOString(), event, detail });
  if (diagnosticEvents.length > 24) diagnosticEvents.shift();
}

export function recordSpeechDiagnostic(event: string, detail?: string): void {
  recordDiagnostic(event, detail);
}

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
    recordDiagnostic('opening-gesture-unlock', `voices=${window.speechSynthesis.getVoices().length}`);
  } catch {
    recordDiagnostic('opening-gesture-unlock-failed');
    /* מתעלמים — נמשיך גם בלי קול */
  }
}

/** מאפס תור תקוע ומחדש את מנוע הדיבור מתוך מחוות המשתמש של כפתור ההאזנה/ניסיון חוזר. */
export function resetSpeechForGesture(): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    recordDiagnostic('gesture-reset-unavailable');
    return false;
  }
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    activeUtterances.clear();
    synth.resume();
    unlocked = true;
    refreshVoices();
    recordDiagnostic('gesture-reset', `voices=${synth.getVoices().length};paused=${synth.paused}`);
    return true;
  } catch {
    recordDiagnostic('gesture-reset-failed');
    return false;
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
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    refreshVoices();
    recordDiagnostic('voices-changed', `voices=${window.speechSynthesis.getVoices().length};hebrew=${listHebrewVoices().length}`);
  });
  refreshVoices();
}

export function getSpeechDiagnostics() {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return {
      available: false,
      unlocked,
      paused: false,
      pending: false,
      speaking: false,
      activeUtterances: 0,
      events: [...diagnosticEvents],
    };
  }
  const synth = window.speechSynthesis;
  return {
    available: true,
    unlocked,
    paused: synth.paused,
    pending: synth.pending,
    speaking: synth.speaking,
    activeUtterances: activeUtterances.size,
    events: [...diagnosticEvents],
  };
}

export interface SpeakOptions {
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (reason?: string) => void;
  /** אל תבטל הקראה קודמת — הוסף לתור. חשוב לרצפי ספרות כדי שאף מספר לא ייבלע. */
  queue?: boolean;
}

/** מקריא טקסט עברי. כברירת מחדל עוצר הקראה קודמת; עם queue מוסיף לתור. */
export function speak(text: string, rate = 0.9, opts: SpeakOptions = {}): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    recordDiagnostic('speak-unavailable');
    opts.onError?.('not-supported');
    return false;
  }
  try {
    const synth = window.speechSynthesis;
    if (!opts.queue) synth.cancel();
    refreshVoices();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'he-IL';
    utterance.rate = opts.rate ?? rate;
    utterance.pitch = 1.05;
    const voice = activeVoice();
    if (voice) utterance.voice = voice;

    const release = () => activeUtterances.delete(utterance);
    utterance.onstart = () => {
      recordDiagnostic('utterance-start', `voice=${voice?.name ?? 'browser-default'};lang=${utterance.lang}`);
      opts.onStart?.();
    };
    utterance.onend = () => {
      release();
      recordDiagnostic('utterance-end');
      opts.onEnd?.();
    };
    utterance.onerror = (event) => {
      release();
      recordDiagnostic('utterance-error', event.error);
      opts.onError?.(event.error);
    };

    activeUtterances.add(utterance);
    synth.resume();
    synth.speak(utterance);
    recordDiagnostic('utterance-queued', `characters=${text.length};voices=${synth.getVoices().length};hebrew=${listHebrewVoices().length}`);
    return true;
  } catch {
    recordDiagnostic('speak-failed');
    opts.onError?.('speak-failed');
    return false;
  }
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    recordDiagnostic('speech-stopped');
  }
  activeUtterances.clear();
}
