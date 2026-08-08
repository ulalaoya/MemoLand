import type { LandId } from '../../types';

const ZONES: { land: LandId; className: string }[] = [
  { land: 'numbers', className: 'numbers' },
  { land: 'echoes', className: 'echoes' },
  { land: 'forest', className: 'forest' },
  { land: 'patterns', className: 'patterns' },
  { land: 'speed', className: 'speed' },
  { land: 'castle', className: 'castle' },
];

export function WorldMapAtmosphere() {
  return (
    <div className="ml-world-atmosphere" aria-hidden>
      {ZONES.map(({ land, className }, index) => (
        <div key={land} className={`ml-world-atmosphere__zone ml-world-atmosphere__zone--${className}`}>
          <span className="ml-world-atmosphere__haze" />
          <span className="ml-world-atmosphere__island ml-world-atmosphere__island--one" />
          <span className="ml-world-atmosphere__island ml-world-atmosphere__island--two" />
          <span className="ml-world-atmosphere__motif ml-world-atmosphere__motif--one" />
          <span className="ml-world-atmosphere__motif ml-world-atmosphere__motif--two" />
          {index === 0 || index === 4 ? <span className="ml-world-atmosphere__cloud" /> : null}
          {index === 2 ? (
            <>
              <span className="ml-world-leaf ml-world-leaf--one" />
              <span className="ml-world-leaf ml-world-leaf--two" />
            </>
          ) : null}
          {index === 1 || index === 5 ? (
            <>
              <span className="ml-world-glint ml-world-glint--one">✦</span>
              <span className="ml-world-glint ml-world-glint--two">✦</span>
            </>
          ) : null}
        </div>
      ))}
    </div>
  );
}
