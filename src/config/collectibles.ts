/* קטלוג האוספים — פריטי לבוש, מדבקות ורקעים שנפתחים במטבעות. */
import type { LandId } from '../types';

export type CollectibleKind = 'hat' | 'sticker' | 'theme';

export interface Collectible {
  id: string;
  kind: CollectibleKind;
  name: string;
  cost: number; // מטבעות לפתיחה
}

/** פריטי לבוש (כובעים) — נלבשים על האוואטר. */
export const HATS: Collectible[] = [
  { id: 'hat.crown', kind: 'hat', name: 'כתר זהב', cost: 300 },
  { id: 'hat.wizard', kind: 'hat', name: 'כובע קוסם', cost: 200 },
  { id: 'hat.party', kind: 'hat', name: 'כובע מסיבה', cost: 150 },
  { id: 'hat.cap', kind: 'hat', name: 'כובע מצחייה', cost: 100 },
];

/** מדבקות דמויות לאיסוף. */
export const STICKERS: Collectible[] = [
  { id: 'sticker.memo', kind: 'sticker', name: 'ממו', cost: 80 },
  { id: 'sticker.water', kind: 'sticker', name: 'טיפת המים', cost: 80 },
  { id: 'sticker.purple', kind: 'sticker', name: 'המפלצת הסגולה', cost: 80 },
  { id: 'sticker.mushroom', kind: 'sticker', name: 'הפטרייה', cost: 80 },
  { id: 'sticker.turtle', kind: 'sticker', name: 'הצב', cost: 80 },
  { id: 'sticker.star', kind: 'sticker', name: 'כוכב הזהב', cost: 120 },
];

/** רקעים / ערכות צבע למסך. */
export const THEMES: Collectible[] = [
  { id: 'theme.day', kind: 'theme', name: 'יום שמשי', cost: 0 }, // ברירת מחדל
  { id: 'theme.sunset', kind: 'theme', name: 'שקיעה', cost: 250 },
  { id: 'theme.night', kind: 'theme', name: 'לילה כוכבי', cost: 250 },
  { id: 'theme.candy', kind: 'theme', name: 'ממתקים', cost: 350 },
];

export const ALL_COLLECTIBLES: Collectible[] = [...HATS, ...STICKERS, ...THEMES];

export function collectibleById(id: string): Collectible | undefined {
  return ALL_COLLECTIBLES.find((c) => c.id === id);
}

/** גרדיאנט רקע לפי ערכת נושא (למפה ולמסכים). */
export const THEME_GRADIENT: Record<string, string> = {
  'theme.day': 'linear-gradient(#8fd8ff,#58C548)',
  'theme.sunset': 'linear-gradient(#ffb36b,#ff7a7a)',
  'theme.night': 'linear-gradient(#2a2b63,#12102e)',
  'theme.candy': 'linear-gradient(#ffa6e6,#a6c8ff)',
};

/* ---------- יעדי הישג לכל עולם ---------- */
export interface WorldGoal {
  land: LandId;
  targetLevel: number; // הרמה שצריך להגיע אליה באחד המנועים של הארץ
  label: string;
}
export const WORLD_GOALS: WorldGoal[] = [
  { land: 'numbers', targetLevel: 10, label: 'הגעת לרמה 10 בעמק המספרים' },
  { land: 'echoes', targetLevel: 10, label: 'הגעת לרמה 10 במערת ההדים' },
  { land: 'forest', targetLevel: 10, label: 'הגעת לרמה 10 ביער התמונות' },
  { land: 'patterns', targetLevel: 10, label: 'הגעת לרמה 10 בהרי התבניות' },
  { land: 'speed', targetLevel: 10, label: 'הגעת לרמה 10 במסלול הזריזות' },
  { land: 'castle', targetLevel: 10, label: 'הגעת לרמה 10 בטירת האוצר' },
];
