import { describe, expect, it } from 'vitest';
import { EXTRAS, OBJECTS, STORIES, SUBJECTS, TAP_ICONS, VERBS } from '../engines/echoesContent';
import { BUNDLED_HEBREW_AUDIO_FILES, resolveBundledHebrewAudioFiles } from './bundledHebrewAudio';

describe('bundled Hebrew Echo corpus', () => {
  it('resolves the generated listen-and-repeat structure through maximum length', () => {
    const text = [SUBJECTS[0], VERBS[0], OBJECTS[0], ...EXTRAS].join(' ');
    expect(resolveBundledHebrewAudioFiles(text)).toHaveLength(9);
  });

  it('covers every listen-and-repeat phrase', () => {
    for (const subject of SUBJECTS) {
      expect(resolveBundledHebrewAudioFiles(`${subject} ${VERBS[0]} ${OBJECTS[0]}`)?.[0]).toContain('subject-');
    }
    for (const verb of VERBS) {
      expect(resolveBundledHebrewAudioFiles(`${SUBJECTS[0]} ${verb} ${OBJECTS[0]}`)?.[1]).toContain('verb-');
    }
    for (const object of OBJECTS) {
      expect(resolveBundledHebrewAudioFiles(`${SUBJECTS[0]} ${VERBS[0]} ${object}`)?.[2]).toContain('object-');
    }
    for (const extra of EXTRAS) {
      expect(resolveBundledHebrewAudioFiles(`${SUBJECTS[0]} ${VERBS[0]} ${OBJECTS[0]} ${extra}`)?.[3]).toContain('extra-');
    }
  });

  it('covers every first and subsequent multi-step instruction', () => {
    for (const icon of TAP_ICONS) {
      const files = resolveBundledHebrewAudioFiles(`גע ב${icon.label}, אחר כך ב${icon.label}`);
      expect(files).toEqual([
        `audio/echo-hebrew/step-first-${icon.id}.wav`,
        `audio/echo-hebrew/step-next-${icon.id}.wav`,
      ]);
    }
  });

  it('covers every built-in story and delayed-recall question', () => {
    for (const story of STORIES) {
      expect(resolveBundledHebrewAudioFiles(story.text)).toHaveLength(1);
      for (const question of story.questions) expect(resolveBundledHebrewAudioFiles(question.q)).toHaveLength(1);
    }
  });

  it('does not synthesize unknown or parent-authored text from unrelated clips', () => {
    expect(resolveBundledHebrewAudioFiles('משפט חדש שלא נמצא בבנק')).toBeNull();
  });

  it('declares all 56 unique WAV assets under the offline Echo asset path', () => {
    expect(BUNDLED_HEBREW_AUDIO_FILES).toHaveLength(56);
    expect(new Set(BUNDLED_HEBREW_AUDIO_FILES).size).toBe(56);
    for (const file of BUNDLED_HEBREW_AUDIO_FILES) {
      expect(file).toMatch(/^audio\/echo-hebrew\/[a-z0-9-]+\.wav$/);
    }
  });
});
