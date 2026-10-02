import './memo-companion.css';
import { characterAssetFor } from '../svg/Memo';
import { useProfiles } from '../../state/store';

export type MemoBehavior = 'idle' | 'attentive' | 'listening' | 'thinking' | 'success';

const MEMO_ASSET: Record<MemoBehavior, string> = {
  idle: './characters/memo-thinking-wizard-v3.png',
  attentive: './characters/memo-listening-wizard-v3.png',
  listening: './characters/memo-listening-wizard-v3.png',
  thinking: './characters/memo-thinking-wizard-v3.png',
  success: './characters/memo-thinking-wizard-v3.png',
};

export function MemoCompanion({
  behavior,
  className = '',
}: {
  behavior: MemoBehavior;
  className?: string;
}) {
  const avatar = useProfiles((registry) => (
    registry.profiles.find((profile) => profile.id === registry.activeId)?.avatar ?? 'memo'
  ));
  const asset = avatar === 'memo' ? MEMO_ASSET[behavior] : characterAssetFor(avatar);
  return (
    <span
      className={`ml-memo-companion ml-memo-companion--${behavior} ${className}`.trim()}
      data-memory-behavior={behavior}
      data-avatar={avatar}
      aria-hidden
    >
      <span className="ml-memo-companion__shadow" />
      <img src={asset} alt="" draggable={false} />
    </span>
  );
}
