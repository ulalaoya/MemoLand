import { EXTRAS, OBJECTS, STORIES, SUBJECTS, TAP_ICONS, VERBS } from '../engines/echoesContent';

const AUDIO_BASE = 'audio/echo-hebrew';

function numberedFile(group: string, index: number): string {
  return `${AUDIO_BASE}/${group}-${String(index + 1).padStart(2, '0')}.wav`;
}

const subjectEntries = SUBJECTS.map((text, index) => [text, numberedFile('subject', index)] as const);
const verbEntries = VERBS.map((text, index) => [text, numberedFile('verb', index)] as const);
const objectEntries = OBJECTS.map((text, index) => [text, numberedFile('object', index)] as const);
const extraEntries = EXTRAS.map((text, index) => [text, numberedFile('extra', index)] as const);
const firstStepEntries = TAP_ICONS.map(
  ({ id, label }) => [`גע ב${label}`, `${AUDIO_BASE}/step-first-${id}.wav`] as const,
);
const nextStepEntries = TAP_ICONS.map(
  ({ id, label }) => [`אחר כך ב${label}`, `${AUDIO_BASE}/step-next-${id}.wav`] as const,
);
const storyEntries = STORIES.map(
  (story) => [story.text, `${AUDIO_BASE}/${story.id.replace('.', '-')}.wav`] as const,
);
const questionEntries = STORIES.flatMap((story) =>
  story.questions.map(
    (question, index) => [question.q, `${AUDIO_BASE}/${story.id.replace('.', '-')}-question-${index + 1}.wav`] as const,
  ),
);

const listenRepeatGroups = [subjectEntries, verbEntries, objectEntries] as const;
const exactAudio = new Map<string, string>([
  ...storyEntries,
  ...questionEntries,
]);
const instructionAudio = new Map<string, string>([
  ...firstStepEntries,
  ...nextStepEntries,
]);

export const BUNDLED_HEBREW_AUDIO_FILES = [
  ...subjectEntries,
  ...verbEntries,
  ...objectEntries,
  ...extraEntries,
  ...firstStepEntries,
  ...nextStepEntries,
  ...storyEntries,
  ...questionEntries,
].map(([, file]) => file);

function consumePhrase(
  remaining: string,
  entries: readonly (readonly [string, string])[],
): { remaining: string; file: string } | null {
  const match = entries
    .slice()
    .sort(([left], [right]) => right.length - left.length)
    .find(([phrase]) => remaining === phrase || remaining.startsWith(`${phrase} `));
  if (!match) return null;
  const [phrase, file] = match;
  return { remaining: remaining.slice(phrase.length).trimStart(), file };
}

/** Resolve only the finite, built-in Echo corpus. Parent-authored or unrelated text is deliberately rejected. */
export function resolveBundledHebrewAudioFiles(text: string): string[] | null {
  const normalized = text.trim().replace(/\s+/g, ' ');
  if (!normalized) return null;

  const exact = exactAudio.get(normalized);
  if (exact) return [exact];

  if (normalized.startsWith('גע ב')) {
    const instructions = normalized.split(',').map((part) => part.trim());
    const files = instructions.map((instruction) => instructionAudio.get(instruction));
    return files.every((file): file is string => Boolean(file)) ? files : null;
  }

  const files: string[] = [];
  let remaining = normalized;
  for (const group of listenRepeatGroups) {
    const consumed = consumePhrase(remaining, group);
    if (!consumed) return null;
    files.push(consumed.file);
    remaining = consumed.remaining;
  }
  while (remaining) {
    const consumed = consumePhrase(remaining, extraEntries);
    if (!consumed) return null;
    files.push(consumed.file);
    remaining = consumed.remaining;
  }
  return files;
}

function assetUrl(file: string): string {
  if (typeof document === 'undefined') return file;
  return new URL(file, document.baseURI).href;
}

export interface BundledHebrewPlayback {
  start(): void;
  cancel(): void;
}

export interface BundledHebrewPlaybackCallbacks {
  onStart: () => void;
  onEnd: () => void;
  onError: (reason: string) => void;
}

/**
 * Use one media element for the complete phrase sequence. The trial starts only on the
 * element's real `playing` event and ends only after the final clip's `ended` event.
 */
export function createBundledHebrewPlayback(
  text: string,
  rate: number,
  callbacks: BundledHebrewPlaybackCallbacks,
): BundledHebrewPlayback | null {
  const resolvedFiles = resolveBundledHebrewAudioFiles(text);
  if (!resolvedFiles || typeof Audio === 'undefined') return null;
  const files = resolvedFiles;

  const audio = new Audio();
  let index = 0;
  let started = false;
  let settled = false;
  let cancelled = false;

  const cleanup = () => {
    audio.removeEventListener('playing', handlePlaying);
    audio.removeEventListener('ended', handleEnded);
    audio.removeEventListener('error', handleError);
  };
  const fail = (reason: string) => {
    if (settled || cancelled) return;
    settled = true;
    cleanup();
    audio.pause();
    callbacks.onError(reason);
  };
  const finish = () => {
    if (settled || cancelled) return;
    settled = true;
    cleanup();
    callbacks.onEnd();
  };
  const playCurrent = () => {
    if (settled || cancelled) return;
    audio.src = assetUrl(files[index]);
    audio.preload = 'auto';
    audio.playbackRate = Math.max(0.6, Math.min(1.2, rate));
    audio.load();
    try {
      const playResult = audio.play();
      playResult?.catch((error: unknown) => {
        const reason = error instanceof Error ? error.name || error.message : 'play-rejected';
        fail(`play-rejected:${reason}`);
      });
    } catch (error) {
      const reason = error instanceof Error ? error.name || error.message : 'play-threw';
      fail(`play-threw:${reason}`);
    }
  };
  function handlePlaying() {
    if (settled || cancelled || started) return;
    started = true;
    callbacks.onStart();
  }
  function handleEnded() {
    if (settled || cancelled) return;
    if (!started) {
      fail('ended-before-playing');
      return;
    }
    index += 1;
    if (index >= files.length) finish();
    else playCurrent();
  }
  function handleError() {
    fail(`media-error:${audio.error?.code ?? 'unknown'}`);
  }

  audio.addEventListener('playing', handlePlaying);
  audio.addEventListener('ended', handleEnded);
  audio.addEventListener('error', handleError);

  return {
    start: playCurrent,
    cancel() {
      if (settled || cancelled) return;
      cancelled = true;
      cleanup();
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    },
  };
}
