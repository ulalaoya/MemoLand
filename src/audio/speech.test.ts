import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveBundledHebrewAudioFiles } from './bundledHebrewAudio';

const ECHO_TEXT = 'הילד אכל תפוח אדום';

function voice(name: string, lang: string): SpeechSynthesisVoice {
  return { name, lang, localService: true, default: false, voiceURI: name } as SpeechSynthesisVoice;
}

class FakeUtterance {
  text: string;
  volume = 1;
  lang = '';
  rate = 1;
  pitch = 1;
  voice: SpeechSynthesisVoice | null = null;
  onstart: ((event: SpeechSynthesisEvent) => void) | null = null;
  onend: ((event: SpeechSynthesisEvent) => void) | null = null;
  onerror: ((event: SpeechSynthesisErrorEvent) => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

class FakeSpeechSynthesis {
  paused = false;
  pending = false;
  speaking = false;
  spoken: FakeUtterance[] = [];
  cancelCount = 0;
  listeners = new Map<string, EventListener[]>();

  constructor(private voices: SpeechSynthesisVoice[]) {}

  getVoices() {
    return this.voices;
  }

  speak(utterance: FakeUtterance) {
    this.spoken.push(utterance);
  }

  cancel() {
    this.cancelCount += 1;
  }

  resume() {
    this.paused = false;
  }

  addEventListener(type: string, listener: EventListener) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }
}

class FakeAudio {
  static instances: FakeAudio[] = [];
  src = '';
  preload = '';
  playbackRate = 1;
  error: { code: number } | null = null;
  playCalls = 0;
  pauseCalls = 0;
  private listeners = new Map<string, Set<() => void>>();

  constructor() {
    FakeAudio.instances.push(this);
  }

  addEventListener(type: string, listener: () => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)?.add(listener);
  }

  removeEventListener(type: string, listener: () => void) {
    this.listeners.get(type)?.delete(listener);
  }

  load() {}

  play() {
    this.playCalls += 1;
    return Promise.resolve();
  }

  pause() {
    this.pauseCalls += 1;
  }

  removeAttribute(name: string) {
    if (name === 'src') this.src = '';
  }

  emit(type: 'playing' | 'ended' | 'error') {
    for (const listener of [...(this.listeners.get(type) ?? [])]) listener();
  }
}

async function setupSpeech(voices: SpeechSynthesisVoice[]) {
  vi.resetModules();
  FakeAudio.instances = [];
  const synth = new FakeSpeechSynthesis(voices);
  vi.stubGlobal('window', { speechSynthesis: synth });
  vi.stubGlobal('document', { baseURI: 'https://example.test/app/' });
  vi.stubGlobal('Audio', FakeAudio);
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
  return { synth, speech: await import('./speech') };
}

function finishFallback(audio: FakeAudio, clipCount: number) {
  audio.emit('playing');
  for (let index = 0; index < clipCount; index += 1) audio.emit('ended');
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('Hebrew speech source selection and lifecycle', () => {
  it('explicitly selects a Hebrew system voice, including he_IL language tags', async () => {
    const hebrew = voice('Hebrew Israel', 'he_IL');
    const { synth, speech } = await setupSpeech([voice('English', 'en-US'), hebrew]);
    const callbacks: string[] = [];

    expect(speech.speak(ECHO_TEXT, 0.9, {
      onStart: () => callbacks.push('start'),
      onEnd: () => callbacks.push('end'),
    })).toBe(true);

    expect(synth.spoken).toHaveLength(1);
    expect(synth.spoken[0].voice).toBe(hebrew);
    expect(synth.spoken[0].lang).toBe('he-IL');
    expect(FakeAudio.instances).toHaveLength(0);
    synth.spoken[0].onstart?.({} as SpeechSynthesisEvent);
    synth.spoken[0].onend?.({} as SpeechSynthesisEvent);
    expect(callbacks).toEqual(['start', 'end']);
    expect(speech.getSpeechDiagnostics().selectedSource).toBe('speechSynthesis-hebrew');
  });

  it('does not attempt SpeechSynthesis when Hebrew voices are missing and selects the fallback', async () => {
    const { synth, speech } = await setupSpeech([voice('English', 'en-US')]);

    expect(speech.speak(ECHO_TEXT)).toBe(true);

    expect(synth.spoken).toHaveLength(0);
    expect(FakeAudio.instances).toHaveLength(1);
    expect(speech.getSpeechDiagnostics()).toMatchObject({
      selectedSource: 'bundled-audio',
      fallbackReason: 'no-hebrew-voice',
    });
  });

  it('waits for the real fallback playing event before reporting playback start, then reports completion', async () => {
    const { speech } = await setupSpeech([]);
    const callbacks: string[] = [];
    const clipCount = resolveBundledHebrewAudioFiles(ECHO_TEXT)?.length ?? 0;

    speech.speak(ECHO_TEXT, 0.9, {
      onStart: () => callbacks.push('start'),
      onEnd: () => callbacks.push('end'),
    });
    const audio = FakeAudio.instances[0];

    expect(callbacks).toEqual([]);
    audio.emit('playing');
    expect(callbacks).toEqual(['start']);
    for (let index = 0; index < clipCount - 1; index += 1) audio.emit('ended');
    expect(callbacks).toEqual(['start']);
    audio.emit('ended');
    expect(callbacks).toEqual(['start', 'end']);
  });

  it('reports fallback playback failure through the existing error callback without advancing', async () => {
    const { speech } = await setupSpeech([]);
    const callbacks: string[] = [];

    speech.speak(ECHO_TEXT, 0.9, {
      onStart: () => callbacks.push('start'),
      onEnd: () => callbacks.push('end'),
      onError: (reason) => callbacks.push(`error:${reason}`),
    });
    const audio = FakeAudio.instances[0];
    audio.error = { code: 4 };
    audio.emit('error');

    expect(callbacks).toEqual(['error:media-error:4']);
  });

  it('falls back after a pre-start synthesis error and ignores stale synthesis callbacks', async () => {
    const { synth, speech } = await setupSpeech([voice('Hebrew Israel', 'he-IL')]);
    const callbacks: string[] = [];
    const clipCount = resolveBundledHebrewAudioFiles(ECHO_TEXT)?.length ?? 0;

    speech.speak(ECHO_TEXT, 0.9, {
      onStart: () => callbacks.push('start'),
      onEnd: () => callbacks.push('end'),
      onError: (reason) => callbacks.push(`error:${reason}`),
    });
    const staleEnd = synth.spoken[0].onend;
    synth.spoken[0].onerror?.({ error: 'synthesis-failed' } as SpeechSynthesisErrorEvent);

    expect(FakeAudio.instances).toHaveLength(1);
    finishFallback(FakeAudio.instances[0], clipCount);
    staleEnd?.({} as SpeechSynthesisEvent);
    expect(callbacks).toEqual(['start', 'end']);
    expect(speech.getSpeechDiagnostics()).toMatchObject({
      selectedSource: 'bundled-audio',
      fallbackReason: 'speech-error:synthesis-failed',
    });
  });

  it('does not replay over a synthesis failure after playback already started', async () => {
    const { synth, speech } = await setupSpeech([voice('Hebrew Israel', 'he-IL')]);
    const callbacks: string[] = [];

    speech.speak(ECHO_TEXT, 0.9, {
      onStart: () => callbacks.push('start'),
      onEnd: () => callbacks.push('end'),
      onError: (reason) => callbacks.push(`error:${reason}`),
    });
    synth.spoken[0].onstart?.({} as SpeechSynthesisEvent);
    synth.spoken[0].onerror?.({ error: 'synthesis-failed' } as SpeechSynthesisErrorEvent);

    expect(FakeAudio.instances).toHaveLength(0);
    expect(callbacks).toEqual(['start', 'error:synthesis-failed']);
  });

  it('uses the same confirmed fallback lifecycle on replay', async () => {
    const { speech } = await setupSpeech([]);
    const callbacks: string[] = [];
    const clipCount = resolveBundledHebrewAudioFiles(ECHO_TEXT)?.length ?? 0;

    speech.speak(ECHO_TEXT, 0.9, {
      onStart: () => callbacks.push('first-start'),
      onEnd: () => callbacks.push('first-end'),
    });
    finishFallback(FakeAudio.instances[0], clipCount);
    expect(speech.resetSpeechForGesture()).toBe(true);
    speech.speak(ECHO_TEXT, 0.9, {
      onStart: () => callbacks.push('replay-start'),
      onEnd: () => callbacks.push('replay-end'),
    });
    finishFallback(FakeAudio.instances[1], clipCount);

    expect(callbacks).toEqual(['first-start', 'first-end', 'replay-start', 'replay-end']);
  });

  it('fails safely for unknown text instead of using an unrelated default voice', async () => {
    const { synth, speech } = await setupSpeech([voice('English', 'en-US')]);
    const errors: string[] = [];

    expect(speech.speak('תוכן לא מוכר', 0.9, { onError: (reason) => errors.push(reason ?? '') })).toBe(false);
    expect(synth.spoken).toHaveLength(0);
    expect(FakeAudio.instances).toHaveLength(0);
    expect(errors).toEqual(['no-hebrew-voice:no-bundled-audio']);
  });
});
