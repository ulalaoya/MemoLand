/* =========================================================================
   MemoLand — טיפוסים משותפים
   השפה של ה-Land: ארץ / מסלול / אתגר / דגל / טירה.
   ========================================================================= */

/** מזהי הארצות. מזהים נשמרים ב-localStorage ולכן לעולם אינם ממוחזרים. */
export type LandId =
  | 'numbers' // עמק המספרים — זיכרון עבודה
  | 'echoes' // מערת ההדים — זיכרון שמיעתי
  | 'connections' // עיר הקשרים — שטף כפל וקשרים בין עובדות
  | 'forest' // יער התמונות — חזותי-מרחבי
  | 'patterns' // הרי התבניות — לוגיקה
  | 'speed' // מסלול הזריזות — מהירות עיבוד
  | 'castle'; // טירת האוצר — שינון

/** מזהה אתגר (engine). ייחודי בכל האפליקציה. */
export type ExerciseId = string;

export type MultiplicationStage = 'DISCOVERING' | 'STRENGTHENING' | 'FLUENT';
export type MultiplicationChallengeType = 'direct' | 'derived' | 'link';
export type MultiplicationRetrievalMode = 'direct' | 'derived';
export type MultiplicationFactId = string;

export interface MultiplicationFactProgress {
  factId: MultiplicationFactId;
  stage: MultiplicationStage;
  directAttempts: number;
  directCorrect: number;
  supportedAttempts: number;
  supportedCorrect: number;
  consecutiveDirectCorrect: number;
  successfulDays: string[];
  lastPracticedAt: number | null;
  dueAt: number;
  intervalIndex: number;
  recentRtMs: number[];
  helpUses: number;
  lastAnchorFactId: MultiplicationFactId | null;
}

export interface MultiplicationAttemptRecord {
  factId: MultiplicationFactId;
  challengeType: MultiplicationChallengeType;
  correct: boolean;
  responseTimeMs: number;
  helpLevelUsed: number;
  mode: MultiplicationRetrievalMode;
  anchorFactId?: MultiplicationFactId;
  sessionId?: string;
  sessionContext?: 'daily' | 'free-play';
  at: number;
}

export type MultiplicationAttemptInput = Omit<MultiplicationAttemptRecord, 'at'> & { at?: number };

export interface MultiplicationProgress {
  facts: Record<MultiplicationFactId, MultiplicationFactProgress>;
  recentAttempts: MultiplicationAttemptRecord[];
}

/** מידע שמותר למנוע להשתמש בו בלי לקשור אותו ישירות ל-store. */
export interface GenerationContext {
  now?: number;
  multiplication?: MultiplicationProgress;
}

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

/** מנוע תרגיל טהור: קלט זהה (כולל context) מחזיר אתגר זהה. */
export interface ExerciseEngine<TStimulus = unknown, TAnswer = unknown> {
  id: ExerciseId;
  landId: LandId;
  /** שם האתגר בשפת ה-Land (מוצג לילד). */
  title: string;
  /** תיאור קצר להורה בדשבורד. */
  parentDescription: string;
  /** יוצר אתגר דטרמיניסטי מ-(level, seed). */
  generate(level: number, seed: number, context?: GenerationContext): Challenge<TStimulus, TAnswer>;
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
  kind: 'hat' | 'sticker' | 'theme' | 'color' | 'background';
  name: string;
}

/** התקדמות בארץ: אילו מסלולים נפתחו/הושלמו. */
export interface LandProgress {
  landId: LandId;
  unlockedTracks: number; // כמה מסלולים נפתחו (1..10)
  completedTracks: number; // כמה הונפו בהם דגלים
  castleOpen: boolean;
}

export type DailyJourneyStatus = 'not-started' | 'in-progress' | 'completed';

/** A serializable activity plan lets an interrupted journey resume at the exact challenge. */
export type JourneyActivity =
  | { kind: 'game'; exerciseId: string; landId: LandId; levelDelta: number; label: string }
  | { kind: 'reveal'; storyId: string; text: string; label: string }
  | { kind: 'quiz'; landId: LandId; label: string; question: string; answer: string; options: string[]; spacedId?: string }
  | { kind: 'speed'; landId: LandId; seconds: number; label: string };

export interface DailyJourneyProgress {
  day: string | null;
  status: DailyJourneyStatus;
  currentActivity: number;
  seed: number;
  earnedPoints: number;
  plan: JourneyActivity[];
}

/** מצב שמור מלא (persistence). */
export interface SaveState {
  version: number;
  coins: number;
  /** סך הצלחות הבנייה המצטבר בכל רובעי העיר; נפרד מנתוני שליטת הכפל. */
  cityGrowthMilestones: number;
  rank: MemoRank;
  stats: Record<ExerciseId, ExerciseStats>;
  lands: Record<LandId, LandProgress>;
  spaced: SpacedItem[];
  medals: Medal[];
  cosmetics: CosmeticItem[];
  equipped: { hat?: string; theme?: string };
  streakDays: number;
  lastPlayedDay: string | null; // YYYY-MM-DD
  streakShieldAvailable: boolean;
  todayPoints: number; // נקודות שנצברו היום (ליעד היומי)
  todayPointsDay: string | null; // היום שאליו שייך todayPoints
  dailyJourney: DailyJourneyProgress;
  /** Three most recently shown challenge contents, used for lightweight anti-repeat. */
  recentChallengeFingerprints: string[];
  settings: Settings;
  parentContent: ParentContent;
  multiplication: MultiplicationProgress;
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
  | 'connections-practice'
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
