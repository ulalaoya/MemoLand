import './memo-companion.css';

export type MemoBehavior = 'idle' | 'attentive' | 'listening' | 'thinking' | 'success';

const MEMO_ASSET: Record<MemoBehavior, string> = {
  idle: './characters/memo-adventure.png',
  attentive: './characters/memo-listening.png',
  listening: './characters/memo-listening.png',
  thinking: './characters/memo-thinking.png',
  success: './characters/memo-adventure.png',
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
