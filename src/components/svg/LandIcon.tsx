/* אמבלמה תמטית לכל ארץ (לפי השם) — לא אוואטר. מוצג באריח מעוגל בצבע הארץ. */
import type { LandId } from '../../types';

const INK = 'var(--ink)';

export function LandIcon({ land, size = 60 }: { land: LandId; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.24),
        overflow: 'hidden',
        border: `${Math.max(2, size * 0.035)}px solid #fff`,
        boxShadow: '0 3px 0 rgba(36,50,71,.18)',
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 60 60" aria-hidden>
        {land === 'numbers' && <Numbers />}
        {land === 'echoes' && <Echoes />}
        {land === 'forest' && <Forest />}
        {land === 'patterns' && <Patterns />}
        {land === 'speed' && <Speed />}
        {land === 'castle' && <Castle />}
      </svg>
    </div>
  );
}

/* עמק המספרים — עמק ירוק עם לבני מספרים */
function Numbers() {
  return (
    <>
      <rect width="60" height="60" fill="#8fd8ff" />
      <path d="M0 42 Q30 34 60 42 V60 H0Z" fill="var(--grass)" />
      <path d="M0 42 Q30 34 60 42" fill="none" stroke="var(--grass-lite)" strokeWidth="4" />
      {['1', '2', '3'].map((n, i) => (
        <g key={n}>
          <rect x={9 + i * 15} y={20} width="13" height="13" rx="2" fill="var(--stone)" stroke={INK} strokeWidth="2" />
          <text x={15.5 + i * 15} y={30} textAnchor="middle" fontFamily="Lilita One, sans-serif" fontSize="10" fill={INK}>{n}</text>
        </g>
      ))}
    </>
  );
}

/* מערת ההדים — מערה חשוכה עם מים והדים */
function Echoes() {
  return (
    <>
      <rect width="60" height="60" fill="#0f2438" />
      <path d="M6 54 Q6 20 30 16 Q54 20 54 54 Z" fill="#1c3b52" stroke="#2f5f7e" strokeWidth="2" />
      <path d="M16 54 Q16 30 30 27 Q44 30 44 54 Z" fill="#0b1d2e" />
      {/* הד — קשתות קול */}
      <path d="M30 40 q-7 0 -7 7" fill="none" stroke="var(--guide-water)" strokeWidth="2.5" opacity="0.9" />
      <path d="M30 40 q7 0 7 7" fill="none" stroke="var(--guide-water)" strokeWidth="2.5" opacity="0.9" />
      <ellipse cx="30" cy="53" rx="18" ry="4" fill="var(--guide-water)" opacity="0.5" />
      <circle cx="30" cy="38" r="3.5" fill="var(--guide-water)" stroke={INK} strokeWidth="1.5" />
    </>
  );
}

/* יער התמונות — יער סבוך */
function Forest() {
  return (
    <>
      <rect width="60" height="60" fill="#bff29a" />
      <rect y="44" width="60" height="16" fill="var(--ground)" />
      {[12, 30, 48].map((x, i) => (
        <g key={x}>
          <rect x={x - 2} y={30 - (i % 2) * 4} width="4" height="18" fill="var(--ground-dk)" />
          <circle cx={x} cy={26 - (i % 2) * 4} r="12" fill="var(--btn-green)" stroke={INK} strokeWidth="1.5" />
        </g>
      ))}
    </>
  );
}

/* הרי התבניות — הרים וגשרים */
function Patterns() {
  return (
    <>
      <rect width="60" height="60" fill="#b79be6" />
      <polygon points="0,50 16,24 32,50" fill="#5a37a0" stroke="#3f2578" strokeWidth="1.5" />
      <polygon points="24,50 42,18 60,50" fill="#6d43c0" stroke="#3f2578" strokeWidth="1.5" />
      <rect y="50" width="60" height="10" fill="#4a2e86" />
      {/* תבנית: משולש עיגול משולש */}
      <polygon points="14,40 18,46 10,46" fill="var(--yellow)" />
      <circle cx="30" cy="43" r="3.5" fill="var(--red)" />
      <polygon points="46,40 50,46 42,46" fill="var(--yellow)" />
    </>
  );
}

/* מסלול הזריזות — מסלול מרוצים בשמיים */
function Speed() {
  return (
    <>
      <rect width="60" height="60" fill="#8fd8ff" />
      <path d="M0 40 Q30 30 60 42 L60 60 L0 60 Z" fill="#5566cc" />
      <path d="M0 48 Q30 39 60 50" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="6 5" />
      {/* דגל משבצות */}
      <rect x="40" y="14" width="12" height="10" fill="#fff" stroke={INK} strokeWidth="1.5" />
      <path d="M40 14h3v3h3v-3h3v3h-3v3h3v-3h-3v3h-3v-3h-3z" fill={INK} />
      <line x1="40" y1="14" x2="40" y2="30" stroke={INK} strokeWidth="2" />
    </>
  );
}

/* טירת האוצר — אולם טירה עם תיבות */
function Castle() {
  return (
    <>
      <rect width="60" height="60" fill="#2a2050" />
      <circle cx="12" cy="12" r="1.5" fill="#ffe9a8" />
      <circle cx="46" cy="10" r="1.5" fill="#ffe9a8" />
      <rect x="12" y="24" width="36" height="30" fill="var(--stone)" stroke={INK} strokeWidth="1.5" />
      {[14, 24, 34, 44].map((x) => (
        <rect key={x} x={x} y="20" width="5" height="6" fill="var(--stone)" stroke={INK} strokeWidth="1.5" />
      ))}
      <rect x="24" y="36" width="12" height="10" rx="2" fill="var(--memo-belt)" stroke={INK} strokeWidth="1.5" />
      <circle cx="30" cy="41" r="2" fill="var(--gold)" stroke={INK} strokeWidth="1" />
    </>
  );
}
