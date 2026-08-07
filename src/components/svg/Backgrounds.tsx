/* רקע אטמוספרי עשיר ומרובד לכל ארץ (סעיף 6) — לא לבן שטוח.
   מצויר כ-SVG בשכבות (גרדיאנטים, גבעות, עננים, פרטים) לתחושת עומק. */
import type { LandId } from '../../types';

export function LandBackground({ land }: { land: LandId }) {
  return (
    <svg
      viewBox="0 0 400 800"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
      aria-hidden
    >
      {land === 'numbers' && <Numbers />}
      {land === 'echoes' && <Echoes />}
      {land === 'forest' && <Forest />}
      {land === 'patterns' && <Patterns />}
      {land === 'speed' && <Speed />}
      {land === 'castle' && <Castle />}
    </svg>
  );
}

/** רקע נוף למסך הבית (גבעות מתגלגלות) — מאחורי המפה. */
export function HomeBackground() {
  return (
    <svg viewBox="0 0 400 900" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} aria-hidden>
      <defs>
        <Grad id="h-sky" stops={[['0', '#8fd8ff'], ['0.4', '#a7e6ba'], ['1', '#7ed070']]} />
        <radialGradient id="h-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF6C8" />
          <stop offset="1" stopColor="#FFE26D" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="900" fill="url(#h-sky)" />
      <circle cx="330" cy="90" r="70" fill="url(#h-sun)" />
      <Cloud x={80} y={70} s={0.8} /> <Cloud x={310} y={140} s={0.6} o={0.85} />
      <Hill y={340} color="#8fe06a" amp={44} />
      <Hill y={470} color="#72d055" amp={36} />
      <Hill y={640} color="#5cc049" amp={30} />
      {/* עצים מפוזרים */}
      {[[40, 430], [360, 500], [30, 640], [370, 690], [60, 780]].map(([x, y], i) => (
        <g key={i} opacity="0.9">
          <rect x={(x as number) - 6} y={y as number} width="12" height="34" fill="#6A4126" />
          <circle cx={x as number} cy={(y as number) - 8} r="28" fill="#4fae3f" stroke="#3d8a31" strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}

function Grad({ id, stops }: { id: string; stops: [string, string][] }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      {stops.map(([off, col]) => (
        <stop key={off} offset={off} stopColor={col} />
      ))}
    </linearGradient>
  );
}

function Cloud({ x, y, s = 1, o = 0.95 }: { x: number; y: number; s?: number; o?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <ellipse cx="0" cy="0" rx="36" ry="21" fill="#fff" />
      <ellipse cx="30" cy="7" rx="27" ry="17" fill="#fff" />
      <ellipse cx="-30" cy="7" rx="25" ry="15" fill="#fff" />
      <ellipse cx="0" cy="12" rx="44" ry="14" fill="#fff" />
    </g>
  );
}

function Hill({ y, color, amp = 40 }: { y: number; color: string; amp?: number }) {
  return (
    <path d={`M0 ${y} Q100 ${y - amp} 200 ${y} T400 ${y} L400 800 L0 800 Z`} fill={color} />
  );
}

/* ---------------- עמק המספרים ---------------- */
function Numbers() {
  return (
    <>
      <defs>
        <Grad id="n-sky" stops={[['0', '#7fd0ff'], ['0.6', '#67C8FF'], ['1', '#9fe0ff']]} />
        <radialGradient id="n-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF6C8" />
          <stop offset="1" stopColor="#FFE26D" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="800" fill="url(#n-sky)" />
      <circle cx="320" cy="120" r="90" fill="url(#n-sun)" />
      <circle cx="320" cy="120" r="34" fill="#FFE26D" />
      <Cloud x={90} y={110} /> <Cloud x={300} y={220} s={0.7} o={0.85} /> <Cloud x={160} y={300} s={0.5} o={0.7} />
      {/* גבעות מרובדות */}
      <Hill y={560} color="#8fe06a" amp={50} />
      <Hill y={620} color="#6fd04f" amp={36} />
      <Hill y={690} color="#58C548" amp={26} />
      {/* לבני מספרים */}
      {[[60, 720], [150, 700], [250, 715], [330, 700]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width="42" height="42" rx="7" fill="#B98A5E" stroke="#6A4126" strokeWidth="3" />
          <rect x={x + 5} y={y + 5} width="32" height="10" rx="3" fill="#fff" opacity="0.25" />
        </g>
      ))}
      {/* פרחים */}
      {[[30, 760], [200, 775], [370, 765]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5" fill="#FFD34E" />
          {[0, 90, 180, 270].map((a) => (
            <circle key={a} cx={x + Math.cos((a * Math.PI) / 180) * 8} cy={y + Math.sin((a * Math.PI) / 180) * 8} r="4" fill="#fff" />
          ))}
          <circle cx={x} cy={y} r="3" fill="#F59D2A" />
        </g>
      ))}
    </>
  );
}

/* ---------------- מערת ההדים ---------------- */
function Echoes() {
  return (
    <>
      <defs>
        <Grad id="e-bg" stops={[['0', '#2a2a63'], ['0.5', '#1b1b48'], ['1', '#101033']]} />
        <radialGradient id="e-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#5fc8ff" stopOpacity="0.6" />
          <stop offset="1" stopColor="#5fc8ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="800" fill="url(#e-bg)" />
      <circle cx="200" cy="420" r="220" fill="url(#e-glow)" />
      {/* נטיפים מלמעלה */}
      {[20, 70, 130, 200, 270, 330, 380].map((x, i) => (
        <path key={x} d={`M${x - 16} 0 L${x + 16} 0 L${x} ${70 + (i % 3) * 30} Z`} fill="#241f52" stroke="#3a3570" strokeWidth="2" />
      ))}
      {/* זקיפים מלמטה */}
      {[40, 110, 300, 360].map((x, i) => (
        <path key={x} d={`M${x - 18} 800 L${x + 18} 800 L${x} ${640 - (i % 2) * 40} Z`} fill="#181341" stroke="#2f2a63" strokeWidth="2" />
      ))}
      {/* גבישים זוהרים */}
      {[[36, 700, '#5fc8ff'], [360, 690, '#8a7bff'], [70, 740, '#5fe0ff']].map(([x, y, c], i) => (
        <g key={i}>
          <path d={`M${x as number} ${(y as number) - 46} L${(x as number) + 14} ${y as number} L${x as number} ${(y as number) + 10} L${(x as number) - 14} ${y as number} Z`} fill={c as string} stroke="#fff" strokeWidth="1.5" opacity="0.9" />
        </g>
      ))}
      {/* בריכת מים */}
      <ellipse cx="200" cy="740" rx="150" ry="26" fill="#3aa0d8" opacity="0.4" />
      {/* ניצוצות */}
      {[[80, 160], [320, 200], [150, 120], [260, 300], [200, 90]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="#fff" opacity="0.8" />
      ))}
    </>
  );
}

/* ---------------- יער התמונות ---------------- */
function Forest() {
  return (
    <>
      <defs>
        <Grad id="f-sky" stops={[['0', '#bdeeff'], ['1', '#8fe0a0']]} />
      </defs>
      <rect width="400" height="800" fill="url(#f-sky)" />
      {/* קרני שמש */}
      <g opacity="0.25">
        {[-30, 0, 30, 60].map((a) => (
          <polygon key={a} points={`60,60 ${60 + Math.cos((a * Math.PI) / 180) * 500},${60 + Math.sin((a * Math.PI) / 180) * 500} ${60 + Math.cos(((a + 8) * Math.PI) / 180) * 500},${60 + Math.sin(((a + 8) * Math.PI) / 180) * 500}`} fill="#fff" />
        ))}
      </g>
      {/* שכבת עצים רחוקה */}
      {[40, 120, 200, 280, 360].map((x, i) => (
        <g key={`b${x}`} opacity="0.6">
          <circle cx={x} cy={430 - (i % 2) * 20} r="52" fill="#5fb84f" />
        </g>
      ))}
      <rect y="500" width="400" height="300" fill="#7a4f2e" />
      <rect y="500" width="400" height="24" fill="#8d5b36" />
      {/* עצים קדמיים */}
      {[30, 130, 250, 370].map((x, i) => (
        <g key={x}>
          <rect x={x - 9} y={430 - (i % 2) * 30} width="18" height="120" rx="4" fill="#6A4126" />
          <circle cx={x} cy={410 - (i % 2) * 30} r="46" fill="#4fae3f" stroke="#3d8a31" strokeWidth="3" />
          <circle cx={x - 16} cy={420 - (i % 2) * 30} r="30" fill="#5fc84f" />
        </g>
      ))}
      {/* שיחים */}
      {[70, 200, 330].map((x) => (
        <g key={`sh${x}`}>
          <ellipse cx={x} cy={640} rx="40" ry="26" fill="#3d8a31" />
          <ellipse cx={x - 18} cy={648} rx="26" ry="18" fill="#4fae3f" />
        </g>
      ))}
    </>
  );
}

/* ---------------- הרי התבניות ---------------- */
function Patterns() {
  return (
    <>
      <defs>
        <Grad id="p-sky" stops={[['0', '#c9b3f0'], ['0.6', '#a583e0'], ['1', '#7a54c8']]} />
      </defs>
      <rect width="400" height="800" fill="url(#p-sky)" />
      {/* כוכבים */}
      {[[60, 90], [200, 60], [330, 110], [120, 150], [280, 170]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="#fff" opacity="0.85" />
      ))}
      {/* הרים מרובדים */}
      <polygon points="0,520 90,320 180,520" fill="#6a48b0" />
      <polygon points="120,540 240,300 360,540" fill="#7a54c8" />
      <polygon points="260,540 350,360 400,460 400,540" fill="#5a3aa0" />
      {/* פסגות שלג */}
      <polygon points="240,300 214,360 266,360" fill="#e9e0ff" opacity="0.85" />
      <polygon points="90,320 70,362 110,362" fill="#e9e0ff" opacity="0.7" />
      <rect y="540" width="400" height="260" fill="#4a2e86" />
      {/* גשר */}
      <rect x="80" y="560" width="240" height="16" rx="4" fill="#8d5b36" stroke="#6A4126" strokeWidth="3" />
      {[100, 160, 220, 280].map((x) => (
        <rect key={x} x={x} y="576" width="8" height="40" fill="#6A4126" />
      ))}
      {/* תבנית צפה */}
      {[[110, 660], [175, 660], [240, 660]].map(([x, y], i) => (
        <g key={i}>
          {i % 2 === 0 ? (
            <polygon points={`${x},${(y as number) - 12} ${(x as number) + 12},${(y as number) + 8} ${(x as number) - 12},${(y as number) + 8}`} fill="#FFD34E" stroke="#243247" strokeWidth="2" />
          ) : (
            <circle cx={x} cy={y} r="11" fill="#F04A3A" stroke="#243247" strokeWidth="2" />
          )}
        </g>
      ))}
    </>
  );
}

/* ---------------- מסלול הזריזות ---------------- */
function Speed() {
  return (
    <>
      <defs>
        <Grad id="s-sky" stops={[['0', '#bdeaff'], ['0.5', '#7fc8ff'], ['1', '#2fa6f6']]} />
      </defs>
      <rect width="400" height="800" fill="url(#s-sky)" />
      <Cloud x={80} y={120} /> <Cloud x={310} y={90} s={0.7} /> <Cloud x={200} y={220} s={0.5} o={0.8} />
      {/* קווי מהירות */}
      {[300, 340, 380, 420, 460].map((y, i) => (
        <line key={y} x1="0" y1={y} x2="400" y2={y + 8} stroke="#fff" strokeWidth={i % 2 ? 2 : 3} opacity="0.3" />
      ))}
      {/* מסלול צף */}
      <path d="M-20 620 Q200 540 420 640 L420 800 L-20 800 Z" fill="#5566cc" />
      <path d="M-20 620 Q200 540 420 640" fill="none" stroke="#42509f" strokeWidth="6" />
      <path d="M-20 690 Q200 615 420 700" fill="none" stroke="#fff" strokeWidth="7" strokeDasharray="30 24" opacity="0.95" />
      {/* קרש מוצא — משבצות */}
      <g transform="translate(300 560)">
        {[0, 1, 2, 3].map((r) =>
          [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={c * 12} y={r * 12} width="12" height="12" fill={(r + c) % 2 ? '#243247' : '#fff'} />),
        )}
      </g>
    </>
  );
}

/* ---------------- טירת האוצר ---------------- */
function Castle() {
  return (
    <>
      <defs>
        <Grad id="c-bg" stops={[['0', '#3a2b6b'], ['0.6', '#241b4a'], ['1', '#14102e']]} />
        <radialGradient id="c-torch" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffcf6b" stopOpacity="0.7" />
          <stop offset="1" stopColor="#ffcf6b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="800" fill="url(#c-bg)" />
      {/* קיר אבן */}
      <rect y="120" width="400" height="560" fill="#3a3560" opacity="0.5" />
      {Array.from({ length: 9 }).map((_, r) =>
        Array.from({ length: 6 }).map((__, c) => (
          <rect key={`${r}${c}`} x={c * 68 + (r % 2 ? -34 : 0)} y={120 + r * 56} width="66" height="54" fill="none" stroke="#4a4478" strokeWidth="1.5" opacity="0.5" />
        )),
      )}
      {/* לפידים */}
      {[70, 330].map((x) => (
        <g key={x}>
          <circle cx={x} cy={220} r="60" fill="url(#c-torch)" />
          <rect x={x - 4} y={230} width="8" height="40" fill="#6A4126" />
          <path d={`M${x} 200 q-10 14 0 28 q10 -14 0 -28`} fill="#F59D2A" />
          <path d={`M${x} 210 q-6 8 0 18 q6 -10 0 -18`} fill="#FFD34E" />
        </g>
      ))}
      {/* דגלים */}
      {[130, 270].map((x) => (
        <path key={x} d={`M${x} 130 h44 l-10 10 l10 10 h-44 z`} fill="#8C52D9" stroke="#243247" strokeWidth="2" />
      ))}
      {/* רצפה */}
      <rect y="660" width="400" height="140" fill="#2a2050" />
      {/* תיבות אוצר */}
      {[80, 320].map((x) => (
        <g key={x}>
          <rect x={x - 30} y={700} width="60" height="42" rx="5" fill="#8d5b36" stroke="#243247" strokeWidth="3" />
          <path d={`M${x - 32} 700 Q${x} 676 ${x + 32} 700 L${x + 32} 694 Q${x} 672 ${x - 32} 694 Z`} fill="#6A4126" stroke="#243247" strokeWidth="3" />
          <circle cx={x} cy={718} r="4" fill="#FFC928" stroke="#243247" strokeWidth="1.5" />
        </g>
      ))}
    </>
  );
}
