import type { CSSProperties } from 'react';
import './logo.css';

type LogoVariant = 'full' | 'compact' | 'icon';

export function Logo({ variant = 'full', width = 240 }: { variant?: LogoVariant; width?: number }) {
  if (variant === 'icon') {
    return (
      <img
        className="ml-brand-icon"
        src="./brand/app-icon-v2.png"
        alt="MemoLand"
        draggable={false}
        style={{ width, height: width, borderRadius: width * 0.22 }}
      />
    );
  }

  return (
    <span
      className={`ml-brand-logo ml-brand-logo--${variant}`}
      role="img"
      aria-label="MemoLand — מסע של זיכרון"
      style={{ '--ml-brand-width': `${width}px` } as CSSProperties}
    >
      <img
        className="ml-brand-logo__art"
        src="./brand/memoland-journey-logo-v3.png"
        alt=""
        draggable={false}
      />
      {variant === 'full' ? <small className="ml-brand-logo__tagline" aria-hidden>מסע של זיכרון</small> : null}
    </span>
  );
}
