/* כפתור לפי ה-Style Guide: פינות 14px, מילוי מלא, מתאר לבן 2px,
   צל תחתון, אייקון בצד ההתחלה (ימין ב-RTL), טקסט לבן 700.
   לחיצה = ירידה 3px וצל מתקצר. */
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

type Variant = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'gold';

const BG: Record<Variant, string> = {
  blue: 'var(--btn-blue)',
  green: 'var(--btn-green)',
  orange: 'var(--btn-orange)',
  purple: 'var(--btn-purple)',
  red: 'var(--btn-red)',
  gold: 'var(--gold-deep)',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
  size?: 'md' | 'lg';
  block?: boolean;
}

export function Button({ variant = 'blue', icon, size = 'md', block, children, style, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`ml-btn ml-btn--${variant} ml-btn--${size}${block ? ' ml-btn--block' : ''} ${rest.className ?? ''}`}
      style={{
        '--ml-btn-color': BG[variant],
        ...style,
      } as CSSProperties}
    >
      {icon ? <span className="ml-btn__icon" aria-hidden>{icon}</span> : null}
      <span className="ml-btn__label">{children}</span>
    </button>
  );
}
