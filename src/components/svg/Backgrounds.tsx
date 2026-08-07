/* רקע אטמוספרי ייחודי לכל ארץ (סעיף 6) — לא לבן שטוח.
   מרונדר כ-SVG מלא-מסך מאחורי התוכן. */
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

function Sky({ from, to }: { from: string; to: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`sky-${from}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill={`url(#sky-${from})`} />
    </>
  );
}

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="0" rx="34" ry="20" fill="#fff" opacity="0.9" />
      <ellipse cx="28" cy="6" rx="26" ry="16" fill="#fff" opacity="0.9" />
      <ellipse cx="-28" cy="6" rx="24" ry="14" fill="#fff" opacity="0.9" />
    </g>
  );
}

function Numbers() {
  return (
    <>
      <Sky from="#67C8FF" to="#2FA6F6" />
      <Cloud x={80} y={90} /> <Cloud x={300} y={150} s={0.8} />
      <rect y="620" width="400" height="180" fill="var(--grass)" />
      <rect y="620" width="400" height="30" fill="var(--grass-lite)" />
      {[40, 140, 240, 340].map((x) => (
        <rect key={x} x={x} y="680" width="46" height="46" rx="6" fill="var(--stone)" stroke="var(--ground-dk)" strokeWidth="3" />
      ))}
    </>
  );
}

function Echoes() {
  return (
    <>
      <Sky from="#2b4a6b" to="#0f2438" />
      <rect y="600" width="400" height="200" fill="#12384f" />
      {[60, 180, 300].map((x, i) => (
        <path key={x} d={`M${x} 800 L${x - 20} ${640 - i * 15} L${x + 20} ${640 - i * 15} Z`} fill="#0c2b3d" stroke="#1e5570" strokeWidth="2" />
      ))}
      {[100, 220, 320].map((x, i) => (
        <path key={x} d={`M${x} 0 L${x - 15} ${120 + i * 20} L${x + 15} ${120 + i * 20} Z`} fill="#0c2b3d" stroke="#1e5570" strokeWidth="2" />
      ))}
      <ellipse cx="200" cy="720" rx="180" ry="30" fill="var(--guide-water)" opacity="0.35" />
    </>
  );
}

function Forest() {
  return (
    <>
      <Sky from="#8fe27a" to="#4fae3f" />
      <rect y="640" width="400" height="160" fill="var(--ground)" />
      {[30, 110, 200, 290, 360].map((x, i) => (
        <g key={x}>
          <rect x={x - 6} y={500 - (i % 2) * 40} width="12" height="180" fill="var(--ground-dk)" />
          <circle cx={x} cy={480 - (i % 2) * 40} r="46" fill="var(--green)" opacity="0.95" />
        </g>
      ))}
    </>
  );
}

function Patterns() {
  return (
    <>
      <Sky from="#b79be6" to="#6d43c0" />
      <polygon points="0,700 120,420 240,700" fill="#5a37a0" stroke="#3f2578" strokeWidth="3" />
      <polygon points="160,700 300,380 400,700" fill="#6d43c0" stroke="#3f2578" strokeWidth="3" />
      <rect y="700" width="400" height="100" fill="#4a2e86" />
      <rect x="120" y="690" width="160" height="14" fill="var(--memo-belt)" stroke="var(--ground-dk)" strokeWidth="2" />
    </>
  );
}

function Speed() {
  return (
    <>
      <Sky from="#8fd8ff" to="#2fa6f6" />
      <Cloud x={90} y={110} /> <Cloud x={310} y={90} s={0.7} />
      <path d="M0 640 Q200 560 400 660 L400 800 L0 800 Z" fill="#5566cc" />
      <path d="M0 690 Q200 620 400 700" fill="none" stroke="#fff" strokeWidth="6" strokeDasharray="26 22" opacity="0.9" />
    </>
  );
}

function Castle() {
  return (
    <>
      <Sky from="#3a2b6b" to="#171233" />
      {[60, 130, 200, 270, 340].map((x) => (
        <circle key={x} cx={x} cy={80 + (x % 3) * 30} r="2.4" fill="#ffe9a8" />
      ))}
      <rect y="640" width="400" height="160" fill="#2a2050" />
      <rect x="70" y="440" width="260" height="220" fill="var(--stone)" stroke="var(--ground-dk)" strokeWidth="4" />
      {[80, 150, 250, 300].map((x) => (
        <rect key={x} x={x} y="410" width="30" height="40" fill="var(--stone)" stroke="var(--ground-dk)" strokeWidth="4" />
      ))}
      <path d="M180 560h40v100h-40z" fill="var(--gold-deep)" stroke="var(--ground-dk)" strokeWidth="3" />
    </>
  );
}
