/* אייקונים למשחק ההוראות (מערת ההדים) — SVG מקורי לפי מזהה. */
const INK = 'var(--ink)';

export function TapGlyph({ id, size = 44 }: { id: string; size?: number }) {
  const c = { width: size, height: size, viewBox: '0 0 44 44' } as const;
  switch (id) {
    case 'star':
      return (
        <svg {...c} aria-hidden>
          <path d="M22 4l5 11 12 1.5-9 8.5 2.5 12L22 31l-10.5 6L14 25 5 16.5 17 15z" fill="var(--yellow)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      );
    case 'flower':
      return (
        <svg {...c} aria-hidden>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="22" cy="12" rx="6" ry="9" fill="var(--btn-purple)" stroke={INK} strokeWidth="2" transform={`rotate(${a} 22 22)`} />
          ))}
          <circle cx="22" cy="22" r="6" fill="var(--yellow)" stroke={INK} strokeWidth="2" />
        </svg>
      );
    case 'sun':
      return (
        <svg {...c} aria-hidden>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="22" y1="3" x2="22" y2="10" stroke={INK} strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${a} 22 22)`} />
          ))}
          <circle cx="22" cy="22" r="10" fill="var(--yellow)" stroke={INK} strokeWidth="2.5" />
        </svg>
      );
    case 'heart':
      return (
        <svg {...c} aria-hidden>
          <path d="M22 38C8 29 5 22 5 15.5 5 10 9 6 14 6c3 0 6 2 8 5 2-3 5-5 8-5 5 0 9 4 9 9.5C39 22 36 29 22 38z" fill="var(--red)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      );
    case 'moon':
      return (
        <svg {...c} aria-hidden>
          <path d="M28 6a16 16 0 100 32 13 13 0 010-32z" fill="var(--gray-300)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      );
    case 'cloud':
      return (
        <svg {...c} aria-hidden>
          <path d="M12 30a7 7 0 010-14 9 9 0 0117-2 6 6 0 011 12z" fill="var(--panel)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      );
    case 'tree':
      return (
        <svg {...c} aria-hidden>
          <rect x="19" y="26" width="6" height="12" fill="var(--ground)" stroke={INK} strokeWidth="2" />
          <circle cx="22" cy="18" r="12" fill="var(--green)" stroke={INK} strokeWidth="2.5" />
        </svg>
      );
    case 'fish':
      return (
        <svg {...c} aria-hidden>
          <path d="M6 22c6-9 20-9 26 0-6 9-20 9-26 0z" fill="var(--btn-blue)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M32 22l7-6v12z" fill="var(--btn-blue)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="14" cy="20" r="2" fill={INK} />
        </svg>
      );
    case 'apple':
      return (
        <svg {...c} aria-hidden>
          <path d="M22 12c-3-3-10-2-10 6 0 8 6 14 10 14s10-6 10-14c0-8-7-9-10-6z" fill="var(--red)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M22 12c0-4 3-6 6-6" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg {...c} aria-hidden>
          <circle cx="22" cy="22" r="12" fill="var(--gray-300)" stroke={INK} strokeWidth="2.5" />
        </svg>
      );
  }
}
