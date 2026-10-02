import './memo-companion.css';

export type MemoBehavior = 'idle' | 'attentive' | 'listening' | 'thinking' | 'success';

const MEMO_ASSET: Record<MemoBehavior, string> = {
  idle: './characters/memo-wizard-v3.png',
  attentive: './characters/memo-listening-wizard-v3.png',
  listening: './characters/memo-listening-wizard-v3.png',
  thinking: './characters/memo-thinking-wizard-v3.png',
  success: './characters/memo-wizard-v3.png',
};

export function MemoCompanion({
  behavior,
  className = '',
}: {
  behavior: MemoBehavior;
  className?: string;
}) {
  return (
    <span
      className={`ml-memo-companion ml-memo-companion--${behavior} ${className}`.trim()}
      data-memory-behavior={behavior}
      aria-hidden
    >
      <span className="ml-memo-companion__shadow" />
      <img src={MEMO_ASSET[behavior]} alt="" draggable={false} />
    </span>
  );
}
