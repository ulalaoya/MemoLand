/* הלוגו הרשמי — תמונה מתוך ה-Branding Board (MEMO LAND + סרט הסלוגן).
   variant: full/compact = הלוגו המלא; icon = אייקון האפליקציה המרובע. */
export function Logo({ variant = 'full', width = 240 }: { variant?: 'full' | 'compact' | 'icon'; width?: number }) {
  if (variant === 'icon') {
    return (
      <img
        src="./app-icon.png"
        alt="MemoLand"
        draggable={false}
        style={{ width, height: width, borderRadius: width * 0.22, display: 'block' }}
      />
    );
  }
  return (
    <img
      src={variant === 'compact' ? './logo-compact.png' : './logo.png'}
      alt="MemoLand — עולם של זיכרון, כל יום"
      draggable={false}
      style={{ width, height: 'auto', display: 'block', filter: 'drop-shadow(0 3px 4px rgba(36,50,71,.25))' }}
    />
  );
}
