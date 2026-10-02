import './calculator-keypad.css';
import type { CSSProperties } from 'react';

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export type CalculatorKeypadTheme = 'valley' | 'city' | 'cars' | 'parent';

export function CalculatorKeypad({
  onDigit,
  onBackspace,
  onSubmit,
  submitDisabled = false,
  backspaceDisabled = false,
  theme,
  submitLabel = '✓',
  className = '',
  style,
}: {
  onDigit: (digit: number) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  submitDisabled?: boolean;
  backspaceDisabled?: boolean;
  theme: CalculatorKeypadTheme;
  submitLabel?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`ml-calculator-keypad ml-calculator-keypad--${theme} ${className}`.trim()}
      style={style}
      dir="ltr"
      aria-label="מקלדת מחשבון"
    >
      {DIGITS.map((digit) => (
        <button
          key={digit}
          type="button"
          className="ml-calculator-keypad__key"
          onClick={() => onDigit(digit)}
          aria-label={`ספרה ${digit}`}
        >
          {digit}
        </button>
      ))}
      <button
        type="button"
        className="ml-calculator-keypad__key ml-calculator-keypad__key--erase"
        onClick={onBackspace}
        disabled={backspaceDisabled}
        aria-label="מחיקת ספרה אחרונה"
      >
        <span aria-hidden>⌫</span>
      </button>
      <button
        type="button"
        className="ml-calculator-keypad__key"
        onClick={() => onDigit(0)}
        aria-label="ספרה 0"
      >
        0
      </button>
      <button
        type="button"
        className="ml-calculator-keypad__key ml-calculator-keypad__key--submit"
        onClick={onSubmit}
        disabled={submitDisabled}
        aria-label="אישור"
      >
        <span aria-hidden>{submitLabel}</span>
      </button>
    </div>
  );
}
