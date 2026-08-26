/* =========================================================================
   הקראה קולית — קול SpeechSynthesis עברי מפורש, או נכסי שמע עבריים מקומיים.
   כל התרגול השמיעתי מוקרא בעברית. ב-iOS ההשמעה חייבת להיווצר מתוך מגע
   ראשון (מסך "הקש כדי להתחיל").
   ========================================================================= */

import {
  createBundledHebrewPlayback,
  resolveBundledHebrewAudioFiles,
  type BundledHebrewPlayback,
} from './bundledHebrewAudio';

let unlocked = false;
/** הקול האוטומטי הטוב ביותר (עברי) שנמצא במכשיר. */
let autoHebrewVoice: SpeechSynthesisVoice | null = null;
/** שם קול שנבחר ידנית בהגדרות (גובר על האוטומטי). */
let preferredVoiceName: string | null = null;
/** Keep utterances alive until the browser reports completion. Some Chromium builds can
 * garbage-collect an unreferenced utterance before its callbacks fire. */
const activeUtterances = new Set<SpeechSynthesisUtterance>();
const activeBundledPlaybacks = new Set<BundledHebrewPlayback>();
const diagnosticEvents: { at: string; event: string; detail?: string }[] = [];
type HebrewAudioSource = 'speechSynthesis-hebrew' | 'bundled-audio';
let lastSelectedSource: HebrewAudioSource | null = null;
let lastFallbackReason: string | null = null;
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
  if (unlocked || typeof window === 'undefined') return;
  unlocked = true;
  const synth = window.speechSynthesis;
  if (!synth) {
    recordDiagnostic('opening-gesture-unlock', 'speech=false;fallback=true');
    return;
  }
  try {
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    synth.speak(u);
    synth.resume();
    refreshVoices();
    recordDiagnostic('opening-gesture-unlock', `voices=${synth.getVoices().length}`);
  } catch {
    recordDiagnostic('opening-gesture-unlock-failed');
    /* The bundled fallback remains available even if synthesis unlock fails. */
  }
}

function cancelActivePlayback(): void {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  activeUtterances.clear();
  try {
    synth?.cancel();
  } catch {
    recordDiagnostic('speech-cancel-failed');
  }
  for (const playback of activeBundledPlaybacks) playback.cancel();
  activeBundledPlaybacks.clear();
}

/** מאפס תור תקוע ומחדש את מנוע הדיבור מתוך מחוות המשתמש של כפתור ההאזנה/ניסיון חוזר. */
export function resetSpeechForGesture(): boolean {
  if (typeof window === 'undefined') {
    recordDiagnostic('gesture-reset-unavailable');
    return false;
  }
  const synth = window.speechSynthesis;
  try {
    cancelActivePlayback();
    synth?.resume();
    unlocked = true;
    refreshVoices();
    recordDiagnostic(
      'gesture-reset',
      `voices=${synth?.getVoices().length ?? 0};hebrew=${listHebrewVoices().length};paused=${synth?.paused ?? false}`,
    );
    return Boolean(synth || typeof Audio !== 'undefined');
  } catch {
    recordDiagnostic('gesture-reset-failed');
    return typeof Audio !== 'undefined';
  }
}

/** כל הקולות בעברית הזמינים במכשיר. */
export function listHebrewVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((voice) => {
      const language = voice.lang?.replace('_', '-').toLowerCase();
      return language === 'he' || language?.startsWith('he-');
    });
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
    const match = listHebrewVoices().find((v) => v.name === preferredVoiceName);
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
      activeBundledPlaybacks: activeBundledPlaybacks.size,
      selectedSource: lastSelectedSource,
      fallbackReason: lastFallbackReason,
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
    activeBundledPlaybacks: activeBundledPlaybacks.size,
    selectedSource: lastSelectedSource,
    fallbackReason: lastFallbackReason,
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
  if (typeof window === 'undefined') {
    recordDiagnostic('speak-unavailable');
    opts.onError?.('not-supported');
    return false;
  }

  if (!opts.queue) cancelActivePlayback();
  const synth = window.speechSynthesis;
  refreshVoices();
  const voice = activeVoice();
  const hasBundledFallback = resolveBundledHebrewAudioFiles(text) !== null;
  let selectedSource: HebrewAudioSource | null = null;
  let started = false;
  let terminal = false;
  let utterance: SpeechSynthesisUtterance | null = null;

  const selectSource = (source: HebrewAudioSource, fallbackReason: string | null) => {
    selectedSource = source;
    lastSelectedSource = source;
    lastFallbackReason = fallbackReason;
    recordDiagnostic(
      'audio-source-selected',
      `source=${source}${fallbackReason ? `;fallbackReason=${fallbackReason}` : ''}`,
    );
  };
  const notifyStart = (source: HebrewAudioSource) => {
    if (terminal || started || selectedSource !== source) return;
    started = true;
    recordDiagnostic('playback-started', `source=${source}`);
    opts.onStart?.();
  };
  const notifyFailure = (source: HebrewAudioSource, reason: string) => {
    if (terminal || selectedSource !== source) return;
    terminal = true;
    recordDiagnostic('playback-failed', `source=${source};reason=${reason}`);
    opts.onError?.(reason);
  };
  const notifyEnd = (source: HebrewAudioSource) => {
    if (terminal || selectedSource !== source) return;
    if (!started) {
      notifyFailure(source, 'ended-before-start');
      return;
    }
    terminal = true;
    recordDiagnostic('playback-ended', `source=${source}`);
    opts.onEnd?.();
  };
  const detachUtterance = () => {
    if (!utterance) return;
    activeUtterances.delete(utterance);
    utterance.onstart = null;
    utterance.onend = null;
    utterance.onerror = null;
  };
  const startFallback = (reason: string): boolean => {
    if (!hasBundledFallback) return false;
    let playback: BundledHebrewPlayback | null = null;
    playback = createBundledHebrewPlayback(text, opts.rate ?? rate, {
      onStart: () => notifyStart('bundled-audio'),
      onEnd: () => {
        if (playback) activeBundledPlaybacks.delete(playback);
        notifyEnd('bundled-audio');
      },
      onError: (fallbackError) => {
        if (playback) activeBundledPlaybacks.delete(playback);
        notifyFailure('bundled-audio', fallbackError);
      },
    });
    if (!playback) return false;
    activeBundledPlaybacks.add(playback);
    selectSource('bundled-audio', reason);
    recordDiagnostic('playback-requested', `source=bundled-audio;characters=${text.length}`);
    playback.start();
    return true;
  };

  if (!synth || !voice) {
    const reason = synth ? 'no-hebrew-voice' : 'speech-unavailable';
    if (startFallback(reason)) return true;
    recordDiagnostic('bundled-audio-unavailable', `reason=${reason};characters=${text.length}`);
    selectedSource = 'bundled-audio';
    lastSelectedSource = 'bundled-audio';
    lastFallbackReason = reason;
    notifyFailure('bundled-audio', `${reason}:no-bundled-audio`);
    return false;
  }

  selectSource('speechSynthesis-hebrew', null);
  recordDiagnostic('playback-requested', `source=speechSynthesis-hebrew;characters=${text.length}`);
  try {
    utterance = new SpeechSynthesisUtterance(text);
    const currentUtterance = utterance;
    currentUtterance.lang = 'he-IL';
    currentUtterance.rate = opts.rate ?? rate;
    currentUtterance.pitch = 1.05;
    currentUtterance.voice = voice;

    currentUtterance.onstart = () => {
      if (!activeUtterances.has(currentUtterance) || selectedSource !== 'speechSynthesis-hebrew') return;
      recordDiagnostic('utterance-start', `voice=${voice.name};lang=${currentUtterance.lang}`);
      notifyStart('speechSynthesis-hebrew');
    };
    currentUtterance.onend = () => {
      if (!activeUtterances.has(currentUtterance) || selectedSource !== 'speechSynthesis-hebrew') return;
      detachUtterance();
      recordDiagnostic('utterance-end');
      notifyEnd('speechSynthesis-hebrew');
    };
    currentUtterance.onerror = (event) => {
      if (!activeUtterances.has(currentUtterance) || selectedSource !== 'speechSynthesis-hebrew') return;
      const failedAfterStart = started;
      detachUtterance();
      recordDiagnostic('utterance-error', event.error);
      if (!failedAfterStart) {
        recordDiagnostic(
          'playback-failed',
          `source=speechSynthesis-hebrew;reason=${event.error};recovering=${hasBundledFallback}`,
        );
        if (!opts.queue) {
          activeUtterances.clear();
          synth.cancel();
        }
        if (startFallback(`speech-error:${event.error}`)) return;
      }
      notifyFailure('speechSynthesis-hebrew', event.error);
    };

    activeUtterances.add(currentUtterance);
    synth.resume();
    synth.speak(currentUtterance);
    recordDiagnostic('utterance-queued', `characters=${text.length};voices=${synth.getVoices().length};hebrew=${listHebrewVoices().length}`);
    return true;
  } catch {
    detachUtterance();
    recordDiagnostic('speak-failed');
    recordDiagnostic(
      'playback-failed',
      `source=speechSynthesis-hebrew;reason=speak-failed;recovering=${hasBundledFallback}`,
    );
    if (startFallback('speech-error:speak-failed')) return true;
    notifyFailure('speechSynthesis-hebrew', 'speak-failed');
    return false;
  }
}

export function stopSpeech(): void {
  cancelActivePlayback();
  recordDiagnostic('speech-stopped');
}
