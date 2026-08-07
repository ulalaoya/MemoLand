/* מסך האוספים — לבוש לדמות, מדבקות דמויות, ורקעים. פותחים במטבעות. */
import { useState } from 'react';
import { HATS, STICKERS, THEMES, THEME_GRADIENT } from '../config/collectibles';
import type { Collectible, CollectibleKind } from '../config/collectibles';
import { buyCollectible, equipCosmetic, getActiveProfile, ownsCollectible, useStore } from '../state/store';
import { Character, HatGlyph } from '../components/svg/Memo';
import { Coin, StarIcon } from '../components/svg/Icons';
import type { AvatarKind } from '../types';

type Tab = 'hat' | 'sticker' | 'theme';

export function CollectionsScreen({ onExit }: { onExit: () => void }) {
  const coins = useStore((s) => s.coins);
  useStore((s) => s.cosmetics);
  const equipped = useStore((s) => s.equipped);
  const profile = getActiveProfile();
  const [tab, setTab] = useState<Tab>('hat');

  const catalog: Record<Tab, Collectible[]> = { hat: HATS, sticker: STICKERS, theme: THEMES };

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--gray-100)', overflowY: 'auto', color: 'var(--ink)' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 3, background: 'var(--btn-purple)', color: '#fff', padding: 'calc(12px + var(--safe-top)) 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <b style={{ fontFamily: 'var(--font-head)', fontSize: 20 }}>🎒 האוספים שלי</b>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.2)', padding: '4px 10px', borderRadius: 999, fontFamily: 'var(--font-head)', fontWeight: 700 }}>
          <Coin size={18} /> <span className="ltr">{coins}</span>
        </span>
        <button onClick={onExit} style={{ background: '#fff', color: 'var(--ink)', border: 'none', borderRadius: 999, padding: '6px 14px', fontWeight: 700 }}>סגור</button>
      </header>

      {/* תצוגת האוואטר עם הכובע */}
      {profile && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 4px' }}>
          <Character kind={profile.avatar} size={110} hat={equipped.hat} />
        </div>
      )}

      {/* לשוניות */}
      <nav style={{ display: 'flex', gap: 6, padding: 10, position: 'sticky', top: 56, background: 'var(--gray-100)', zIndex: 2 }}>
        {([['hat', 'לבוש'], ['sticker', 'מדבקות'], ['theme', 'רקעים']] as [Tab, string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', fontWeight: 700, fontFamily: 'var(--font-head)', background: tab === t ? 'var(--btn-purple)' : 'var(--panel)', color: tab === t ? '#fff' : 'var(--ink)' }}>{label}</button>
        ))}
      </nav>

      <div style={{ padding: '4px 14px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {catalog[tab].map((item) => (
          <ItemCard key={item.id} item={item} coins={coins} kind={tab} equipped={equipped} />
        ))}
      </div>
    </div>
  );
}

function ItemVisual({ item, kind }: { item: Collectible; kind: CollectibleKind }) {
  if (kind === 'hat') return <div style={{ width: 56, height: 56 }}><HatGlyph id={item.id} /></div>;
  if (kind === 'theme') return <div style={{ width: 60, height: 44, borderRadius: 10, background: THEME_GRADIENT[item.id] ?? '#ccc', border: '2px solid var(--gray-300)' }} />;
  // sticker
  const stickerKind = item.id.replace('sticker.', '');
  if (stickerKind === 'star') return <StarIcon size={52} />;
  return <Character kind={stickerKind as AvatarKind} size={56} />;
}

function ItemCard({ item, coins, kind, equipped }: { item: Collectible; coins: number; kind: CollectibleKind; equipped: { hat?: string; theme?: string } }) {
  const owned = ownsCollectible(item.id) || item.cost === 0;
  const isEquipped = (kind === 'hat' && equipped.hat === item.id) || (kind === 'theme' && (equipped.theme ?? 'theme.day') === item.id);
  const canEquip = kind === 'hat' || kind === 'theme';

  function act() {
    if (!owned) {
      if (!buyCollectible(item)) {
        alert('אין מספיק מטבעות עדיין — תמשיך לאסוף!');
        return;
      }
    }
    if (canEquip) equipCosmetic(kind as 'hat' | 'theme', item.id);
  }

  return (
    <div style={{ background: 'var(--panel)', borderRadius: 14, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, border: `2px solid ${isEquipped ? 'var(--btn-green)' : 'var(--gray-300)'}` }}>
      <div style={{ height: 60, display: 'grid', placeItems: 'center' }}>
        <ItemVisual item={item} kind={kind} />
      </div>
      <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 13, textAlign: 'center' }}>{item.name}</div>
      <button
        onClick={act}
        disabled={owned && !canEquip}
        style={{
          width: '100%', padding: '7px 0', borderRadius: 10, border: 'none', fontWeight: 700, fontFamily: 'var(--font-head)', fontSize: 13,
          background: isEquipped ? 'var(--btn-green)' : owned ? 'var(--btn-blue)' : coins >= item.cost ? 'var(--gold-deep)' : 'var(--gray-300)',
          color: isEquipped || owned || coins >= item.cost ? '#fff' : 'var(--ink)',
        }}
      >
        {isEquipped ? 'נבחר ✓' : owned ? (canEquip ? 'בחר' : 'בבעלותך') : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{item.cost} <Coin size={14} /></span>
        )}
      </button>
    </div>
  );
}
