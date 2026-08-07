/**
 * מחולל מספרים פסאודו-אקראי דטרמיניסטי (mulberry32).
 * זרע זהה => רצף זהה. חיוני כדי שמנועי התרגילים יהיו בדיקים.
 */
export function makeRng(seed: number) {
  let a = seed >>> 0;
  return {
    /** מספר ממשי [0,1). */
    next(): number {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    /** מספר שלם בטווח [min, max] כולל. */
    int(min: number, max: number): number {
      return min + Math.floor(this.next() * (max - min + 1));
    },
    /** בחירת פריט מרשימה. */
    pick<T>(arr: readonly T[]): T {
      return arr[this.int(0, arr.length - 1)];
    },
    /** ערבוב מערך (Fisher–Yates), מחזיר עותק חדש. */
    shuffle<T>(arr: readonly T[]): T[] {
      const out = arr.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = this.int(0, i);
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
  };
}

export type Rng = ReturnType<typeof makeRng>;
