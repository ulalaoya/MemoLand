import './memo-companion.css';

export type MemoCompanionPose = 'ready' | 'listening' | 'thinking' | 'success';

const MEMO_ASSET: Record<MemoCompanionPose, string> = {
  ready: './characters/memo-listening.png',
  listening: './characters/memo-listening.png',
  thinking: './characters/memo-thinking.png',
  success: './characters/memo-adventure.png',
};

export function MemoCompanion({
  pose,
  className = '',
}: {
  pose: MemoCompanionPose;
  className?: string;
}) {
  return (
    <span className={`ml-memo-companion ml-memo-companion--${pose} ${className}`.trim()} aria-hidden>
      <span className="ml-memo-companion__shadow" />
      <img src={MEMO_ASSET[pose]} alt="" draggable={false} />
    </span>
  );
}
