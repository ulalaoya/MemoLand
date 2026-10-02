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
      <img className="ml-brand-logo__emblem" src="./brand/journey-emblem-v2.png" alt="" draggable={false} />
      <span className="ml-brand-logo__wordmark" aria-hidden>
        <span className="ml-brand-logo__spark ml-brand-logo__spark--left">✦</span>
        <span className="ml-brand-logo__title"><span>MEMO</span><span>LAND</span></span>
        <span className="ml-brand-logo__spark ml-brand-logo__spark--right">✦</span>
        {variant === 'full' ? <small>מסע של זיכרון</small> : null}
      </span>
    </span>
  );
}
