import type { LandId } from '../../types';

export function WorldIllustration({ land }: { land: LandId }) {
  return (
    <svg className="ml-world-illustration" viewBox="0 0 240 150" aria-hidden focusable="false">
      {land === 'numbers' ? <NumbersValley /> : null}
      {land === 'echoes' ? <EchoCave /> : null}
      {land === 'forest' ? <ImageForest /> : null}
      {land === 'patterns' ? <PatternMountains /> : null}
      {land === 'speed' ? <SpeedTrack /> : null}
      {land === 'castle' ? <TreasureCastle /> : null}
    </svg>
  );
}

const OUTLINE = 'var(--ml-navy)';

function NumbersValley() {
  return (
    <>
      <defs>
        <linearGradient id="numbers-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#67C8FF" />
          <stop offset="1" stopColor="#DFF7FF" />
        </linearGradient>
        <linearGradient id="numbers-trail" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFE98D" />
          <stop offset="1" stopColor="#F59D2A" />
        </linearGradient>
      </defs>
      <rect width="240" height="150" rx="22" fill="url(#numbers-sky)" />
      <circle cx="199" cy="29" r="18" fill="#FFC928" stroke={OUTLINE} strokeWidth="2.5" />
      <Cloud x={44} y={28} scale={0.72} />
      <path d="M0 92 Q45 58 98 90 T240 82V150H0Z" fill="#91E35D" stroke={OUTLINE} strokeWidth="2.5" />
      <path d="M0 112 Q52 76 110 108 T240 100V150H0Z" fill="#58C548" stroke={OUTLINE} strokeWidth="2.5" />
      <path d="M93 150 C88 125 111 117 106 95 C101 75 123 70 134 59" fill="none" stroke="#fff" strokeWidth="18" strokeLinecap="round" />
      <path d="M93 150 C88 125 111 117 106 95 C101 75 123 70 134 59" fill="none" stroke="url(#numbers-trail)" strokeWidth="12" strokeLinecap="round" />
      <NumberBlock x={24} y={85} value="1" color="#2E8DF6" rotation={-7} />
      <NumberBlock x={105} y={50} value="2" color="#F04A3A" rotation={3} />
      <NumberBlock x={178} y={88} value="3" color="#8C52D9" rotation={7} />
      <circle cx="29" cy="132" r="4" fill="#fff" />
      <circle cx="211" cy="124" r="5" fill="#FFC928" stroke={OUTLINE} strokeWidth="1.5" />
    </>
  );
}

function EchoCave() {
  return (
    <>
      <defs>
        <linearGradient id="echo-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#252858" />
          <stop offset="1" stopColor="#151737" />
        </linearGradient>
        <radialGradient id="echo-glow" cx="0.5" cy="0.55" r="0.5">
          <stop offset="0" stopColor="#67C8FF" stopOpacity="0.75" />
          <stop offset="1" stopColor="#67C8FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="240" height="150" rx="22" fill="url(#echo-bg)" />
      <circle cx="120" cy="84" r="78" fill="url(#echo-glow)" />
      <path d="M0 0H240V34L216 26 197 51 173 25 149 42 127 13 104 40 82 22 61 51 38 25 18 38 0 30Z" fill="#353477" stroke={OUTLINE} strokeWidth="2.5" />
      <path d="M0 150V118L24 91 46 125 70 102 94 150ZM240 150V105L216 84 194 126 174 106 151 150Z" fill="#2B2C68" stroke={OUTLINE} strokeWidth="2.5" />
      <Crystal x={30} y={111} color="#67C8FF" scale={0.9} />
      <Crystal x={203} y={105} color="#A783FF" scale={1.08} />
      <Crystal x={177} y={126} color="#55E3FF" scale={0.65} />
      <g transform="translate(109 88)">
        <path d="M0 20C-2 6 4-5 14-8c12 2 18 13 16 28z" fill="#4FC3FF" stroke={OUTLINE} strokeWidth="2.5" />
        <circle cx="9" cy="8" r="2" fill={OUTLINE} />
        <circle cx="21" cy="8" r="2" fill={OUTLINE} />
        <path d="M11 15q4 4 8 0" fill="none" stroke={OUTLINE} strokeWidth="2" strokeLinecap="round" />
      </g>
      {[32, 45, 58].map((radius) => (
        <path key={radius} d={`M${120 - radius} 92 Q120 ${92 - radius * 0.72} ${120 + radius} 92`} fill="none" stroke="#A9EBFF" strokeWidth="2.4" strokeLinecap="round" opacity={1 - radius / 100} />
      ))}
      <ellipse cx="120" cy="137" rx="70" ry="8" fill="#3DA7D8" opacity="0.45" />
      <Spark x={76} y={63} color="#fff" />
      <Spark x={162} y={56} color="#67C8FF" />
    </>
  );
}

function ImageForest() {
  return (
    <>
      <defs>
        <linearGradient id="forest-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#BDEEFF" />
          <stop offset="1" stopColor="#DDF6C8" />
        </linearGradient>
      </defs>
      <rect width="240" height="150" rx="22" fill="url(#forest-sky)" />
      <circle cx="40" cy="28" r="17" fill="#FFE26D" opacity="0.9" />
      <path d="M0 105Q45 78 87 103T175 96T240 98V150H0Z" fill="#58C548" stroke={OUTLINE} strokeWidth="2.5" />
      <Tree x={22} y={54} scale={0.9} />
      <Tree x={204} y={46} scale={1.05} />
      <Tree x={182} y={75} scale={0.7} />
      <g transform="translate(76 36) rotate(-2 46 40)">
        <rect width="96" height="80" rx="10" fill="#8D5B36" stroke={OUTLINE} strokeWidth="3" />
        <rect x="8" y="8" width="80" height="64" rx="6" fill="#fff" stroke="#fff" strokeWidth="3" />
        <rect x="12" y="12" width="72" height="56" rx="4" fill="#67C8FF" />
        <circle cx="68" cy="26" r="9" fill="#FFC928" />
        <path d="M12 59L35 36l16 14 12-11 21 20v9H12Z" fill="#3CAA4A" />
        <path d="M12 63L30 48l15 12 11-8 20 16H12Z" fill="#91E35D" />
      </g>
      <Leaf x={61} y={30} rotation={-22} color="#58C548" />
      <Leaf x={177} y={24} rotation={28} color="#3CAA4A" />
      <Leaf x={53} y={122} rotation={36} color="#91E35D" />
      <Leaf x={194} y={124} rotation={-40} color="#FFC928" />
    </>
  );
}

function PatternMountains() {
  return (
    <>
      <defs>
        <linearGradient id="pattern-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#BFA7EF" />
          <stop offset="1" stopColor="#5267D9" />
        </linearGradient>
      </defs>
      <rect width="240" height="150" rx="22" fill="url(#pattern-sky)" />
      <Spark x={31} y={27} color="#fff" />
      <Spark x={202} y={34} color="#FFC928" />
      <circle cx="120" cy="29" r="15" fill="#E9DFFF" opacity="0.75" />
      <path d="M-8 126L52 48l58 78Z" fill="#6940B7" stroke={OUTLINE} strokeWidth="2.5" />
      <path d="M53 126L127 30l72 96Z" fill="#8C52D9" stroke={OUTLINE} strokeWidth="2.5" />
      <path d="M137 126l53-70 58 70Z" fill="#5267D9" stroke={OUTLINE} strokeWidth="2.5" />
      <path d="M109 54l18-24 18 24-9-3-9 8-9-8Z" fill="#fff" opacity="0.88" />
      <path d="M0 126H240V150H0Z" fill="#4D358B" stroke={OUTLINE} strokeWidth="2.5" />
      <g transform="translate(45 113)">
        <rect x="0" y="0" width="22" height="22" rx="4" fill="#2E8DF6" stroke={OUTLINE} strokeWidth="2.4" />
        <circle cx="48" cy="11" r="11" fill="#F04A3A" stroke={OUTLINE} strokeWidth="2.4" />
        <path d="M84 0l13 22H71Z" fill="#FFC928" stroke={OUTLINE} strokeWidth="2.4" strokeLinejoin="round" />
        <rect x="120" y="0" width="22" height="22" rx="4" fill="#2E8DF6" stroke={OUTLINE} strokeWidth="2.4" />
      </g>
      <path d="M35 106C69 89 88 90 111 103s49 13 87-6" fill="none" stroke="#fff" strokeWidth="5" strokeDasharray="7 8" strokeLinecap="round" opacity="0.75" />
    </>
  );
}

function SpeedTrack() {
  return (
    <>
      <defs>
        <linearGradient id="speed-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#67C8FF" />
          <stop offset="1" stopColor="#E7F8FF" />
        </linearGradient>
      </defs>
      <rect width="240" height="150" rx="22" fill="url(#speed-sky)" />
      <Cloud x={184} y={28} scale={0.56} />
      {[35, 52, 69].map((y, index) => (
        <path key={y} d={`M${8 + index * 5} ${y}h46`} stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity={0.78 - index * 0.12} />
      ))}
      <path d="M-12 145C47 83 124 69 252 96V160H-12Z" fill="#5267D9" stroke={OUTLINE} strokeWidth="3" />
      <path d="M-5 137C55 91 130 82 245 104" fill="none" stroke="#fff" strokeWidth="16" opacity="0.95" />
      <path d="M-5 137C55 91 130 82 245 104" fill="none" stroke="#F59D2A" strokeWidth="9" strokeDasharray="21 13" />
      <g transform="translate(57 35)">
        <circle cx="28" cy="28" r="25" fill="#fff" stroke={OUTLINE} strokeWidth="3" />
        <path d="M22 1h12v8H22z" fill="#FFC928" stroke={OUTLINE} strokeWidth="2" />
        <path d="M28 28l11-10" stroke="#F04A3A" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="28" cy="28" r="4" fill="#2E8DF6" stroke={OUTLINE} strokeWidth="1.8" />
        <path d="M13 14l-5-5M43 14l5-5" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" />
      </g>
      <g transform="translate(183 45)">
        <path d="M0 0v68" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />
        <rect x="2" y="4" width="42" height="32" rx="2" fill="#fff" stroke={OUTLINE} strokeWidth="2.5" />
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2, 3].map((column) => (
            <rect key={`${row}-${column}`} x={4 + column * 10} y={6 + row * 7} width="10" height="7" fill={(row + column) % 2 === 0 ? OUTLINE : '#fff'} />
          )),
        )}
      </g>
    </>
  );
}

function TreasureCastle() {
  return (
    <>
      <defs>
        <linearGradient id="castle-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#34295D" />
          <stop offset="1" stopColor="#8C52D9" />
        </linearGradient>
        <radialGradient id="castle-glow" cx="0.5" cy="0.55" r="0.55">
          <stop offset="0" stopColor="#FFC928" stopOpacity="0.62" />
          <stop offset="1" stopColor="#FFC928" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="240" height="150" rx="22" fill="url(#castle-sky)" />
      <circle cx="120" cy="76" r="88" fill="url(#castle-glow)" />
      <Spark x={28} y={29} color="#FFC928" />
      <Spark x={208} y={23} color="#fff" />
      <circle cx="52" cy="53" r="2.5" fill="#fff" opacity="0.8" />
      <circle cx="183" cy="48" r="2" fill="#FFC928" opacity="0.9" />
      <path d="M0 128Q50 108 91 126T164 122T240 118V150H0Z" fill="#302454" stroke={OUTLINE} strokeWidth="2.5" />
      <g transform="translate(66 35)">
        <path d="M8 91V35h21V17l12 10 13-10 13 10 12-10v18h21v56Z" fill="#FFF3C2" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
        <path d="M29 91V48h50v43" fill="#E7B94D" stroke={OUTLINE} strokeWidth="3" />
        <path d="M44 91V67a10 10 0 0120 0v24" fill="#6940B7" stroke={OUTLINE} strokeWidth="3" />
        <rect x="13" y="45" width="10" height="15" rx="5" fill="#67C8FF" stroke={OUTLINE} strokeWidth="2" />
        <rect x="85" y="45" width="10" height="15" rx="5" fill="#67C8FF" stroke={OUTLINE} strokeWidth="2" />
        <path d="M53 15V0" stroke={OUTLINE} strokeWidth="3" />
        <path d="M55 1h23l-5 6 5 6H55Z" fill="#F04A3A" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
      </g>
      <path d="M111 150c0-16 2-30 9-45 7 15 9 29 9 45" fill="#FFC928" stroke="#fff" strokeWidth="3" />
      <g transform="translate(16 105)">
        <path d="M2 15h44v25H2z" fill="#8D5B36" stroke={OUTLINE} strokeWidth="3" />
        <path d="M0 15C4-2 44-2 48 15Z" fill="#654025" stroke={OUTLINE} strokeWidth="3" />
        <circle cx="24" cy="25" r="5" fill="#FFC928" stroke={OUTLINE} strokeWidth="2" />
        <circle cx="8" cy="8" r="4" fill="#FFC928" />
        <circle cx="17" cy="5" r="4" fill="#FFE98D" />
        <circle cx="37" cy="8" r="4" fill="#FFC928" />
      </g>
    </>
  );
}

function NumberBlock({ x, y, value, color, rotation }: { x: number; y: number; value: string; color: string; rotation: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation} 18 18)`}>
      <rect width="36" height="36" rx="8" fill={color} stroke={OUTLINE} strokeWidth="2.5" />
      <path d="M6 7h24" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.42" />
      <text x="18" y="27" textAnchor="middle" fontFamily="Lilita One, sans-serif" fontSize="24" fill="#fff" stroke={OUTLINE} strokeWidth="0.8" paintOrder="stroke">
        {value}
      </text>
    </g>
  );
}

function Cloud({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="#fff" opacity="0.85">
      <ellipse cx="0" cy="7" rx="31" ry="13" />
      <circle cx="-14" cy="0" r="13" />
      <circle cx="6" cy="-5" r="18" />
      <circle cx="22" cy="4" r="12" />
    </g>
  );
}

function Crystal({ x, y, color, scale }: { x: number; y: number; color: string; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 0l11-27 10 27-10 12Z" fill={color} stroke={OUTLINE} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M11-27v39M0 0h21" stroke="#fff" strokeWidth="1.5" opacity="0.55" />
    </g>
  );
}

function Tree({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="-5" y="33" width="10" height="43" rx="4" fill="#8D5B36" stroke={OUTLINE} strokeWidth="2.5" />
      <circle cx="0" cy="20" r="27" fill="#3CAA4A" stroke={OUTLINE} strokeWidth="2.5" />
      <circle cx="-14" cy="29" r="18" fill="#58C548" />
      <circle cx="15" cy="28" r="17" fill="#91E35D" />
    </g>
  );
}

function Leaf({ x, y, rotation, color }: { x: number; y: number; rotation: number; color: string }) {
  return <path d={`M${x} ${y}c15-7 22 0 18 13-13 3-20-3-18-13Z`} fill={color} stroke={OUTLINE} strokeWidth="1.8" transform={`rotate(${rotation} ${x} ${y})`} />;
}

function Spark({ x, y, color }: { x: number; y: number; color: string }) {
  return <path d={`M${x} ${y - 8}l2.5 5.5L${x + 8} ${y}l-5.5 2.5L${x} ${y + 8}l-2.5-5.5L${x - 8} ${y}l5.5-2.5Z`} fill={color} />;
}
