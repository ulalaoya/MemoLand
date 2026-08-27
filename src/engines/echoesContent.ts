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
