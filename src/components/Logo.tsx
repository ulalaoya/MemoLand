/* הלוגו — לעולם לא טקסט רגיל.
   "MEMO" באותיות צבעוניות, "LAND" בלבן עם מתאר, סרט כחול עם התגית.
   שלוש גרסאות: full / icon / compact. */
const INK = 'var(--ink)';
const LETTER = { fontFamily: 'Lilita One, sans-serif', fill: '#fff' } as const;

export function Logo({ variant = 'full', width = 240 }: { variant?: 'full' | 'compact' | 'icon'; width?: number }) {
  if (variant === 'icon') {
    return (
      <svg width={width} height={width} viewBox="0 0 96 96" aria-label="MemoLand">
        <rect x="4" y="4" width="88" height="88" rx="20" fill="var(--btn-blue)" stroke={INK} strokeWidth="4" />
        <circle cx="34" cy="42" r="14" fill="var(--red)" stroke={INK} strokeWidth="4" />
        <circle cx="62" cy="42" r="14" fill="var(--green)" stroke={INK} strokeWidth="4" />
        <text x="48" y="80" textAnchor="middle" fontFamily="Lilita One, sans-serif" fontSize="22" fill="#fff" stroke={INK} strokeWidth="1">
          ML
        </text>
      </svg>
    );
  }

  const colors = ['var(--red)', 'var(--yellow)', 'var(--green)', 'var(--blue)'];
  const memo = 'MEMO'.split('');
  const h = variant === 'compact' ? width * 0.4 : width * 0.62;

  return (
    <svg width={width} height={h} viewBox={`0 0 240 ${variant === 'compact' ? 96 : 150}`} aria-label="MemoLand — עולם של זיכרון, כל יום">
      <g stroke={INK} strokeWidth="5" strokeLinejoin="round" paintOrder="stroke">
        {memo.map((ch, i) => (
          <text key={i} x={30 + i * 48} y="52" textAnchor="middle" fontFamily="Lilita One, sans-serif" fontSize="52" fill={colors[i]}>
            {ch}
          </text>
        ))}
      </g>
      <text x="120" y="98" textAnchor="middle" style={LETTER} fontSize="44" stroke={INK} strokeWidth="5" paintOrder="stroke">
        LAND
      </text>
      {variant === 'full' && (
        <g>
          <rect x="46" y="116" width="148" height="26" rx="13" fill="var(--btn-blue)" stroke={INK} strokeWidth="3" />
          <text x="120" y="134" textAnchor="middle" fontFamily="Rubik, sans-serif" fontWeight="700" fontSize="15" fill="#fff">
            עולם של זיכרון, כל יום
          </text>
        </g>
      )}
    </svg>
  );
}
