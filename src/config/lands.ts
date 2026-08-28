import type { LandId } from '../types';

/** מטא-דאטה של ארץ: שם, מדריך, צבע ניווט, רקע. */
export interface LandMeta {
  id: LandId;
  name: string; // שם הארץ בשפת ה-Land
  guide: string; // המדריך (דמות מה-Style Guide)
  /** משתנה הצבע (CSS var) — רמז ניווט קבוע: כותרת, מסגרת, דגלים, טבעת. */
  colorVar: string;
  subtitle: string; // מה מתאמנים (להורה)
  order: number;
}

/**
 * ארצות ממו לנד הפעילות. הסדר קובע את סדר המפה; מזהי העבר נשארים קבועים.
 * הצבע הוא רמז ניווט קבוע (סעיף 9 בפרומפט).
 */
export const LANDS: Record<LandId, LandMeta> = {
  numbers: {
    id: 'numbers',
    name: 'עמק המספרים',
    guide: 'ממו',
    colorVar: '--btn-blue',
    subtitle: 'זיכרון עבודה',
    order: 1,
  },
  echoes: {
    id: 'echoes',
    name: 'מערת ההדים',
    guide: 'טיפת המים',
    colorVar: '--guide-water',
    subtitle: 'זיכרון שמיעתי',
    order: 2,
  },
  connections: {
    id: 'connections',
    name: 'עיר הקשרים',
    guide: 'ממו',
    colorVar: '--ml-city-teal',
    subtitle: 'שטף כפל וקשרים בין עובדות',
    order: 3,
  },
  forest: {
    id: 'forest',
    name: 'יער התמונות',
    guide: 'הצב',
    colorVar: '--btn-green',
    subtitle: 'זיכרון חזותי-מרחבי',
    order: 4,
  },
  patterns: {
    id: 'patterns',
    name: 'הרי התבניות',
    guide: 'המפלצת הסגולה',
    colorVar: '--btn-purple',
    subtitle: 'לוגיקה ורצפים',
    order: 5,
  },
  speed: {
    id: 'speed',
    name: 'מסלול הזריזות',
    guide: 'הפטרייה',
    colorVar: '--btn-orange',
    subtitle: 'מהירות עיבוד',
    order: 6,
  },
  castle: {
    id: 'castle',
    name: 'טירת האוצר',
    guide: 'ממו',
    colorVar: '--gold',
    subtitle: 'שינון וקידוד',
    order: 7,
  },
};

export const LAND_ORDER: LandId[] = Object.values(LANDS)
  .sort((a, b) => a.order - b.order)
  .map((l) => l.id);

/** מספר המסלולים בכל ארץ. */
export const TRACKS_PER_LAND = 10;

/** צבע הארץ כערך CSS מוכן לשימוש (var(...)). */
export function landColor(id: LandId): string {
  return `var(${LANDS[id].colorVar})`;
}
