import { describe, expect, it } from 'vitest';
import { MAX_LEVEL, MIN_LEVEL, sentenceComponentCount } from '../config/curriculum';
import { listenRepeat } from './echoes';
import { LISTEN_REPEAT_BETA_SENTENCES } from './echoesContent';

const EXPECTED_SENTENCES = [
  ['הילד מצא תפוח אדום', ['הילד', 'מצא', 'תפוח אדום']],
  ['סבתא ראתה פרח צהוב', ['סבתא', 'ראתה', 'פרח צהוב']],
  ['הציפור בנתה קן קטן', ['הציפור', 'בנתה', 'קן קטן']],
  ['ממו הביא כדור גדול לגינה', ['ממו', 'הביא', 'כדור גדול', 'לגינה']],
  ['הילדה קראה ספר מצחיק בערב', ['הילדה', 'קראה', 'ספר מצחיק', 'בערב']],
  ['הארנב מצא גזר גדול ליד העץ', ['הארנב', 'מצא', 'גזר גדול', 'ליד העץ']],
  ['הכלב מצא כדור אדום מתחת לספסל בגינה', ['הכלב', 'מצא', 'כדור אדום', 'מתחת לספסל', 'בגינה']],
  [
    'סבתא הכינה עוגת שוקולד לנכדים אחר הצהריים',
    ['סבתא', 'הכינה', 'עוגת שוקולד', 'לנכדים', 'אחר הצהריים'],
  ],
  ['ממו שם בקבוק מים בתוך התיק לפני הטיול', ['ממו', 'שם', 'בקבוק מים', 'בתוך התיק', 'לפני הטיול']],
  [
    'הילדה אספה שלוש צדפות עם אחותה על החוף בבוקר',
    ['הילדה', 'אספה', 'שלוש צדפות', 'עם אחותה', 'על החוף', 'בבוקר'],
  ],
  [
    'סבתא שתלה פרחים צבעוניים ליד העץ בגינה ביום שישי',
    ['סבתא', 'שתלה', 'פרחים צבעוניים', 'ליד העץ', 'בגינה', 'ביום שישי'],
  ],
  [
    'הילד החזיר את הספר למדף העליון בספרייה אחרי השיעור',
    ['הילד', 'החזיר', 'את הספר', 'למדף העליון', 'בספרייה', 'אחרי השיעור'],
  ],
] as const;

describe('Echo ListenRepeat curated beta content', () => {
  it('contains only the exact 12 approved sentences and tile decompositions', () => {
    expect(LISTEN_REPEAT_BETA_SENTENCES.map(({ text, tiles }) => [text, tiles])).toEqual(EXPECTED_SENTENCES);
    expect(LISTEN_REPEAT_BETA_SENTENCES).toHaveLength(12);
  });

  it('contains three sentences in each 3/4/5/6-component tier', () => {
    expect(
      [3, 4, 5, 6].map((count) => LISTEN_REPEAT_BETA_SENTENCES.filter(({ tiles }) => tiles.length === count).length),
    ).toEqual([3, 3, 3, 3]);
    for (const { text, tiles } of LISTEN_REPEAT_BETA_SENTENCES) expect(tiles.join(' ')).toBe(text);
  });

  it('generates only bank sentences at the component count assigned to the level', () => {
    const bankTexts = new Set(LISTEN_REPEAT_BETA_SENTENCES.map(({ text }) => text));
    for (let level = MIN_LEVEL; level <= MAX_LEVEL; level += 1) {
      for (let seed = 1; seed <= 100; seed += 1) {
        const challenge = listenRepeat.generate(level, seed);
        expect(challenge.prompt).toBeDefined();
        expect(bankTexts.has(challenge.prompt!)).toBe(true);
        expect(challenge.stimulus.words).toHaveLength(sentenceComponentCount(level));
        expect(challenge.stimulus.words.join(' ')).toBe(challenge.prompt);
      }
    }
  });

  it('remains deterministic for the same level and seed', () => {
    for (let level = MIN_LEVEL; level <= MAX_LEVEL; level += 1) {
      expect(listenRepeat.generate(level, 8472)).toEqual(listenRepeat.generate(level, 8472));
    }
  });
});
