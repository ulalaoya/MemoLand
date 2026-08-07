/* כפתור לפי ה-Style Guide: פינות 14px, מילוי מלא, מתאר לבן 2px,
   צל תחתון, אייקון בצד ההתחלה (ימין ב-RTL), טקסט לבן 700.
   לחיצה = ירידה 3px וצל מתקצר. */
import type { ButtonHTMLAttributes, ReactNode } from 'react';

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
      className={`ml-btn ${rest.className ?? ''}`}
      style={{
        display: block ? 'flex' : 'inline-flex',
        width: block ? '100%' : undefined,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        background: BG[variant],
        color: '#fff',
        fontWeight: 700,
        fontSize: size === 'lg' ? 22 : 18,
        padding: size === 'lg' ? '16px 26px' : '12px 20px',
        border: '2px solid #fff',
        borderRadius: 14,
        boxShadow: 'var(--btn-shadow)',
        transition: 'transform .08s, box-shadow .08s',
        textShadow: '0 1px 1px rgba(36,50,71,.35)',
        ...style,
      }}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
