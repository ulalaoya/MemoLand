/* בנק תוכן לעברית פשוטה (רמת כיתה ב') עבור מערת ההדים.
   נשמר בנפרד כדי שיהיה קל להרחיב ולהחליף בתוכן הורה. */

/** רכיבים לבניית משפטים אקראיים תקינים: נושא + פועל תואם מגדר + מושא/תיאור. */
export type GrammaticalGender = 'masculine' | 'feminine';

export interface EchoSubject {
  text: string;
  gender: GrammaticalGender;
}

export interface EchoVerb {
  masculine: string;
  feminine: string;
}

export const SUBJECTS: EchoSubject[] = [
  { text: 'הילד', gender: 'masculine' },
  { text: 'הכלב', gender: 'masculine' },
  { text: 'החתול', gender: 'masculine' },
  { text: 'סבתא', gender: 'feminine' },
  { text: 'הדג', gender: 'masculine' },
  { text: 'הציפור', gender: 'feminine' },
  { text: 'ממו', gender: 'masculine' },
  { text: 'הארנב', gender: 'masculine' },
];

export const VERBS: EchoVerb[] = [
  { masculine: 'אכל', feminine: 'אכלה' },
  { masculine: 'ראה', feminine: 'ראתה' },
  { masculine: 'מצא', feminine: 'מצאה' },
  { masculine: 'אהב', feminine: 'אהבה' },
  { masculine: 'צייר', feminine: 'ציירה' },
  { masculine: 'שמר', feminine: 'שמרה' },
  { masculine: 'הביא', feminine: 'הביאה' },
  { masculine: 'חיפש', feminine: 'חיפשה' },
];
export const OBJECTS = [
  'תפוח אדום',
  'כדור גדול',
  'ספר כחול',
  'פרח צהוב',
  'עוגה מתוקה',
  'כובע ירוק',
  'מטבע זהב',
  'בית קטן',
];
export const EXTRAS = ['בגינה', 'בבוקר', 'ליד הים', 'בשמחה', 'מתחת לעץ', 'בערב'];
export const CONTRADICTORY_EXTRA_PAIRS: readonly (readonly [string, string])[] = [['בבוקר', 'בערב']];

export interface ListenRepeatBetaSentence {
  id: string;
  text: string;
  tiles: readonly string[];
  difficulty: 3 | 4 | 5 | 6;
}

/**
 * משפטים מלאים עם קובץ שמע רציף ומוקלט לכל משפט. difficulty שומר את
 * מדרגת הזיכרון המקורית; במסך כל מילה מוצגת באריח נפרד, ללא צירופי מילים.
 */
const RECORDED_LISTEN_REPEAT_SENTENCES: readonly Omit<ListenRepeatBetaSentence, 'tiles'>[] = [
  { id: 'listen-repeat-beta-01', text: 'הילד מצא תפוח אדום', difficulty: 3 },
  { id: 'listen-repeat-beta-02', text: 'סבתא ראתה פרח צהוב', difficulty: 3 },
  { id: 'listen-repeat-beta-03', text: 'הציפור בנתה קן קטן', difficulty: 3 },
  { id: 'listen-repeat-beta-04', text: 'ממו הביא כדור גדול לגינה', difficulty: 4 },
  { id: 'listen-repeat-beta-05', text: 'הילדה קראה ספר מצחיק בערב', difficulty: 4 },
  { id: 'listen-repeat-beta-06', text: 'הארנב מצא גזר גדול ליד העץ', difficulty: 4 },
  { id: 'listen-repeat-beta-07', text: 'הכלב מצא כדור אדום מתחת לספסל בגינה', difficulty: 5 },
  { id: 'listen-repeat-beta-08', text: 'סבתא הכינה עוגת שוקולד לנכדים אחר הצהריים', difficulty: 5 },
  { id: 'listen-repeat-beta-09', text: 'ממו שם בקבוק מים בתוך התיק לפני הטיול', difficulty: 5 },
  { id: 'listen-repeat-beta-10', text: 'הילדה אספה שלוש צדפות עם אחותה על החוף בבוקר', difficulty: 6 },
  { id: 'listen-repeat-beta-11', text: 'סבתא שתלה פרחים צבעוניים ליד העץ בגינה ביום שישי', difficulty: 6 },
  { id: 'listen-repeat-beta-12', text: 'הילד החזיר את הספר למדף העליון בספרייה אחרי השיעור', difficulty: 6 },
];

export const LISTEN_REPEAT_BETA_SENTENCES: readonly ListenRepeatBetaSentence[] =
  RECORDED_LISTEN_REPEAT_SENTENCES.map((sentence) => ({ ...sentence, tiles: sentence.text.split(' ') }));

/** אייקונים למשחק ההוראות (מזהה + שם עברי + אימוג'י פנימי לצייר כ-SVG). */
export interface TapIcon {
  id: string;
  label: string;
}
export const TAP_ICONS: TapIcon[] = [
  { id: 'star', label: 'כוכב' },
  { id: 'flower', label: 'פרח' },
  { id: 'sun', label: 'שמש' },
  { id: 'heart', label: 'לב' },
  { id: 'moon', label: 'ירח' },
  { id: 'cloud', label: 'ענן' },
  { id: 'tree', label: 'עץ' },
  { id: 'fish', label: 'דג' },
  { id: 'apple', label: 'תפוח' },
];

/** סיפורים קצרים (~30 שניות) עם שאלות לשליפה מושהית. */
export interface Story {
  id: string;
  text: string;
  questions: { q: string; answer: string; options: string[] }[];
}
export const STORIES: Story[] = [
  {
    id: 'story.picnic',
    text: 'ממו יצא לפיקניק עם החברים. הוא לקח סל עם שלושה תפוחים, בקבוק מים וכדור אדום. הם ישבו מתחת לעץ גדול ושיחקו כל הבוקר.',
    questions: [
      { q: 'כמה תפוחים ממו לקח?', answer: 'שלושה', options: ['שניים', 'שלושה', 'ארבעה'] },
      { q: 'איזה צבע היה הכדור?', answer: 'אדום', options: ['כחול', 'אדום', 'ירוק'] },
      { q: 'איפה הם ישבו?', answer: 'מתחת לעץ', options: ['על גשר', 'מתחת לעץ', 'ליד הים'] },
    ],
  },
  {
    id: 'story.beach',
    text: 'טיפת המים הלכה לים בבוקר. היא בנתה ארמון חול עם ארבעה מגדלים ודגל כחול למעלה. אחר כך היא אספה חמש צדפות יפות.',
    questions: [
      { q: 'כמה מגדלים היו לארמון?', answer: 'ארבעה', options: ['שלושה', 'ארבעה', 'חמישה'] },
      { q: 'איזה צבע היה הדגל?', answer: 'כחול', options: ['כחול', 'צהוב', 'אדום'] },
      { q: 'כמה צדפות היא אספה?', answer: 'חמש', options: ['ארבע', 'חמש', 'שש'] },
    ],
  },
];
