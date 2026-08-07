/* =========================================================================
   MemoLand — טיפוסים משותפים
   השפה של ה-Land: ארץ / מסלול / אתגר / דגל / טירה.
   ========================================================================= */

/** מזהי הארצות (6 ארצות של ממו לנד). */
export type LandId =
  | 'numbers' // עמק המספרים — זיכרון עבודה
  | 'echoes' // מערת ההדים — זיכרון שמיעתי
  | 'forest' // יער התמונות — חזותי-מרחבי
  | 'patterns' // הרי התבניות — לוגיקה
  | 'speed' // מסלול הזריזות — מהירות עיבוד
  | 'castle'; // טירת האוצר — שינון

/** מזהה אתגר (engine). ייחודי בכל האפליקציה. */
export type ExerciseId = string;

/** תוצר של generator: הגירוי, התשובה הנכונה, ופרמטרים לתצוגה. */
export interface Challenge<TStimulus = unknown, TAnswer = unknown> {
  exerciseId: ExerciseId;
  landId: LandId;
  level: number; // 1..15
  /** הגירוי שמוצג/מוקרא לילד. */
  stimulus: TStimulus;
  /** התשובה הנכונה — תמיד נגזרת מהגירוי. */
  answer: TAnswer;
  /** פרמטרים חופשיים לרנדור (זמני חשיפה, מספר הסחות וכו'). */
  params: Record<string, number | string | boolean>;
  /** טקסט/משפט להקראה קולית של ההוראה. */
  prompt?: string;
}

/** מנוע תרגיל טהור: (level, seed) => Challenge. ללא תלות ב-UI. */
export interface ExerciseEngine<TStimulus = unknown, TAnswer = unknown> {
  id: ExerciseId;
  landId: LandId;
  /** שם האתגר בשפת ה-Land (מוצג לילד). */
  title: string;
  /** תיאור קצר להורה בדשבורד. */
  parentDescription: string;
  /** יוצר אתגר דטרמיניסטי מ-(level, seed). */
  generate(level: number, seed: number): Challenge<TStimulus, TAnswer>;
  /** בדיקת תשובה. מוגדר במנוע כדי שאפשר לבדוק אותו ללא UI. */
  check(challenge: Challenge<TStimulus, TAnswer>, given: TAnswer): boolean;
}

/** מדדים נשמרים לכל אתגר. */
export interface ExerciseStats {
  level: number; // רמה נוכחית 1..15
  peakLevel: number; // השיא שהושג אי-פעם
  attempts: number;
  correct: number;
  streakCorrect: number; // רצף נכונות עכשווי
  bestStreak: number;
  consecutiveWrong: number; // לצורך הקלה שקטה אחרי 2 טעויות
  medianRtMs: number; // זמן תגובה חציוני (מתגלגל)
  rtSamples: number[]; // דגימות אחרונות לחישוב חציון
  maxSpan: number; // span מרבי (רלוונטי לתרגילי רצף)
}

/** דרגות ממו לפי סך המטבעות. */
export type MemoRank = 'beginner' | 'scout' | 'adventurer' | 'hero' | 'legend';

/** פריט בתור החזרות במרווחים. */
export interface SpacedItem {
  id: string; // מזהה ייחודי לפריט הנלמד
  landId: LandId;
  kind: 'castle' | 'delayed'; // פריט טירת האוצר / הפריט המושהה היומי
  payload: { question: string; answer: string; options?: string[] };
  intervalIdx: number; // אינדקס בסולם המרווחים
  dueAt: number; // timestamp להופעה הבאה
  createdAt: number;
}

/** מדליית הישג. */
export interface Medal {
  id: string;
  tier: 'bronze' | 'silver' | 'gold';
  earnedAt: number;
}

/** פריט קישוט לחנות (מתיבת האוצר). */
export interface CosmeticItem {
  id: string;
  kind: 'hat' | 'color' | 'background';
  name: string;
}

/** התקדמות בארץ: אילו מסלולים נפתחו/הושלמו. */
export interface LandProgress {
  landId: LandId;
  unlockedTracks: number; // כמה מסלולים נפתחו (1..10)
  completedTracks: number; // כמה הונפו בהם דגלים
  castleOpen: boolean;
}

/** מצב שמור מלא (persistence). */
export interface SaveState {
  version: number;
  coins: number;
  rank: MemoRank;
  stats: Record<ExerciseId, ExerciseStats>;
  lands: Record<LandId, LandProgress>;
  spaced: SpacedItem[];
  medals: Medal[];
  cosmetics: CosmeticItem[];
  equipped: { hat?: string; background?: string };
  streakDays: number;
  lastPlayedDay: string | null; // YYYY-MM-DD
  streakShieldAvailable: boolean;
  todayPoints: number; // נקודות שנצברו היום (ליעד היומי)
  todayPointsDay: string | null; // היום שאליו שייך todayPoints
  settings: Settings;
  parentContent: ParentContent;
  history: DayRecord[]; // רשומות יומיות לדשבורד
}

export interface Settings {
  sessionMinutes: 10 | 15 | 20 | 25;
  speechRate: number; // 0.6..1.2
  soundEffects: boolean;
  reminderHour: number | null; // 0..23
  parentConfirmsPhysical: boolean; // האם ההורה מאשר הוראות פיזיות
  parentPin: string; // קוד 4 ספרות
  voiceName: string | null; // שם קול ההקראה הנבחר (עברי). null = בחירה אוטומטית
}

/** דמות אווטאר לפרופיל (אחת מדמויות ה-Style Guide). */
export type AvatarKind = 'memo' | 'water' | 'purple' | 'mushroom' | 'turtle';

/** פרופיל משתמש — לכל ילד/משתמש התקדמות נפרדת. */
export interface Profile {
  id: string;
  name: string;
  avatar: AvatarKind;
  createdAt: number;
}

/** מרשם הפרופילים במכשיר. */
export interface ProfileRegistry {
  activeId: string | null;
  profiles: Profile[];
}

/** תוכן שההורה מזין (טירת האוצר / מערת ההדים). */
export interface ParentContent {
  wordLists: { title: string; items: string[] }[];
  sentences: string[];
  paragraphs: { title: string; text: string }[];
}

/** רשומת יום לדשבורד. */
export interface DayRecord {
  day: string; // YYYY-MM-DD
  minutes: number;
  perLand: Partial<Record<LandId, { attempts: number; correct: number }>>;
}

/** שלב בסשן היומי. */
export type SessionStepKind =
  | 'warmup'
  | 'delayed-reveal'
  | 'yesterday'
  | 'rotation'
  | 'speed'
  | 'delayed-recall'
  | 'guaranteed-finish';

export interface SessionStep {
  kind: SessionStepKind;
  label: string; // כותרת בשפת ה-Land
  exerciseId?: ExerciseId;
  landId?: LandId;
  rounds: number; // כמה אתגרים בשלב
  hasTimer?: boolean;
  timerSeconds?: number;
}

export interface DailySession {
  steps: SessionStep[];
  builtAt: number;
  targetMinutes: number;
}
