import { describe, expect, it } from 'vitest';
import { LISTEN_REPEAT_BETA_SENTENCES, STORIES, TAP_ICONS } from '../engines/echoesContent';
import { BUNDLED_HEBREW_AUDIO_FILES, resolveBundledHebrewAudioFiles } from './bundledHebrewAudio';

describe('bundled Hebrew Echo corpus', () => {
  it('resolves every curated ListenRepeat sentence to exactly one stable full-utterance WAV', () => {
    for (const { id, text } of LISTEN_REPEAT_BETA_SENTENCES) {
      expect(resolveBundledHebrewAudioFiles(text)).toEqual([`audio/echo-hebrew/${id}.wav`]);
    }
  });

  it('never resolves ListenRepeat through legacy component concatenation', () => {
    expect(resolveBundledHebrewAudioFiles('הילד אכל תפוח אדום')).toBeNull();
    for (const { text } of LISTEN_REPEAT_BETA_SENTENCES) {
      expect(resolveBundledHebrewAudioFiles(text)).toHaveLength(1);
    }
  });

  it('keeps every first and subsequent MultiStep instruction mapping available for later restoration', () => {
    for (const icon of TAP_ICONS) {
      expect(resolveBundledHebrewAudioFiles(`גע ב${icon.label}, אחר כך ב${icon.label}`)).toEqual([
        `audio/echo-hebrew/step-first-${icon.id}.wav`,
        `audio/echo-hebrew/step-next-${icon.id}.wav`,
      ]);
    }
  });

  it('resolves every built-in story to one full WAV', () => {
    for (const story of STORIES) expect(resolveBundledHebrewAudioFiles(story.text)).toHaveLength(1);
  });

  it('resolves every delayed-recall question to one full WAV', () => {
    for (const story of STORIES) {
      for (const question of story.questions) expect(resolveBundledHebrewAudioFiles(question.q)).toHaveLength(1);
    }
  });

  it('does not synthesize unknown or parent-authored text from unrelated clips', () => {
    expect(resolveBundledHebrewAudioFiles('משפט חדש שלא נמצא בבנק')).toBeNull();
  });

  it('declares the 20 full utterances plus 18 retained MultiStep instruction assets', () => {
    expect(BUNDLED_HEBREW_AUDIO_FILES).toHaveLength(38);
    expect(new Set(BUNDLED_HEBREW_AUDIO_FILES).size).toBe(38);
    for (const file of BUNDLED_HEBREW_AUDIO_FILES) {
      expect(file).toMatch(/^audio\/echo-hebrew\/[a-z0-9-]+\.wav$/);
    }
  });
});
