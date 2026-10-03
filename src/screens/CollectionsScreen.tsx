/* מסך האוספים — לבוש לדמות, מדבקות דמויות, ורקעים. פותחים במטבעות. */
import { useState } from 'react';
import { HATS, STICKERS, THEMES, THEME_GRADIENT } from '../config/collectibles';
import type { Collectible, CollectibleKind } from '../config/collectibles';
import { buyCollectible, equipCosmetic, getActiveProfile, ownsCollectible, useStore } from '../state/store';
import { Character, HatGlyph } from '../components/svg/Memo';
import { Coin, StarIcon } from '../components/svg/Icons';
import type { AvatarKind } from '../types';
import {
  CITY_BUILD_PROJECT_COUNT,
  CityProjectPuzzle,
  cityBuildProject,
  cityProjectCollectibleId,
} from '../components/games/ConnectionsCityGame';
import './meta-screens.css';
import { JourneyCollectionGlyph } from '../components/world/PlayerHUD';
import { orderedCityProjectIndices } from './collectionOrder';

type Tab = 'build' | 'hat' | 'sticker' | 'theme';

export function CollectionsScreen({ onExit }: { onExit: () => void }) {
  const coins = useStore((s) => s.coins);
  const cosmetics = useStore((s) => s.cosmetics);
  const equipped = useStore((s) => s.equipped);
  const profile = getActiveProfile();
  const [tab, setTab] = useState<Tab>('build');
  const [notice, setNotice] = useState<string | null>(null);

  const catalog: Record<Exclude<Tab, 'build'>, Collectible[]> = { hat: HATS, sticker: STICKERS, theme: THEMES };
  const tabItems = tab === 'build' ? [] : catalog[tab];
  const ownedInTab = tab === 'build'
    ? Array.from({ length: CITY_BUILD_PROJECT_COUNT }, (_, index) => cityProjectCollectibleId(index)).filter((id) => cosmetics.some((item) => item.id === id)).length
    : tabItems.filter((item) => ownsCollectible(item.id) || item.cost === 0).length;
  const totalInTab = tab === 'build' ? CITY_BUILD_PROJECT_COUNT : tabItems.length;

  return (
    <div className="ml-meta-screen ml-meta-screen--collections">
      <div className="ml-meta-screen__backdrop" aria-hidden />
      <header className="ml-meta-header">
        <span className="ml-meta-header__icon" aria-hidden><JourneyCollectionGlyph /></span>
        <div className="ml-meta-header__copy">
          <small>האוצרות שמצאת בדרך</small>
          <h1>האוספים שלי</h1>
        </div>
        <span className="ml-meta-coins" aria-label={`${coins} מטבעות`}>
          <Coin size={18} /> <span className="ltr">{coins}</span>
        </span>
        <button className="ml-meta-close ml-pressable" onClick={onExit} aria-label="חזרה למפה">→</button>
      </header>

      <div className="ml-collection-hero">
        {profile && <div className="ml-collection-hero__avatar"><Character kind={profile.avatar} size={118} hat={equipped.hat} /></div>}
        <div className="ml-collection-hero__copy"><strong>המחסן של ההרפתקן</strong><span>בחרו פריט והפכו אותו לשלכם</span></div>
      </div>

      <nav className="ml-collection-tabs" aria-label="סוג אוסף">
        {([['build', 'פאזלים'], ['hat', 'אביזרי קסם'], ['sticker', 'אלבום מדבקות'], ['theme', 'רקעים']] as [Tab, string][]).map(([t, label]) => (
          <button key={t} className={tab === t ? 'is-active' : ''} onClick={() => setTab(t)}><span>{label}</span></button>
        ))}
      </nav>

      <div className="ml-collection-album-heading">
        <strong>{tab === 'build' ? 'הפאזלים שהושלמו' : tab === 'sticker' ? 'אלבום המדבקות שלי' : tab === 'hat' ? 'אביזרי המסע שלי' : 'עולמות שפתחתי'}</strong>
        <span className="ltr">{ownedInTab}/{totalInTab}</span>
      </div>

      {notice ? (
        <button type="button" className="ml-collection-notice" onClick={() => setNotice(null)} aria-live="polite">
          <span aria-hidden>✦</span> {notice}
        </button>
      ) : null}

      <div className="ml-collection-grid">
        {tab === 'build'
          ? orderedCityProjectIndices(
              Array.from({ length: CITY_BUILD_PROJECT_COUNT }, (_, index) => cityProjectCollectibleId(index)),
              cosmetics,
            ).map((projectIndex) => {
              const project = cityBuildProject(projectIndex);
              const owned = cosmetics.some((item) => item.id === cityProjectCollectibleId(projectIndex));
              return <CityBuildCard key={project.kind} projectIndex={projectIndex} owned={owned} />;
            })
          : catalog[tab].map((item) => (
              <ItemCard key={item.id} item={item} coins={coins} kind={tab} equipped={equipped} onNotify={setNotice} />
            ))}
      </div>
    </div>
  );
}

function CityBuildCard({ projectIndex, owned }: { projectIndex: number; owned: boolean }) {
  const project = cityBuildProject(projectIndex);
  const name = project.title.replace(/^(בונים|מרכיבים)\s+/, '');
  return (
    <article className={`ml-collection-card ml-collection-card--build${owned ? ' is-owned' : ' is-locked'}`}>
      <div className={`ml-build-collectible${owned ? ' is-owned' : ''}`} aria-hidden>
        {!owned ? <span className="ml-build-collectible__star">✦</span> : null}
        {owned ? (
          <CityProjectPuzzle project={project} projectIndex={projectIndex} builtCount={15} justAdded={0} />
        ) : (
          <span className="ml-build-collectible__icon">◇</span>
        )}
        {!owned ? <span className="ml-build-collectible__path" /> : null}
      </div>
      <strong>{owned ? name : 'כרטיס מסתורי'}</strong>
      <span className="ml-build-collectible__status">{owned ? 'הרווחת בעיר הקשרים' : 'השלימו 15 תרגילים כדי לגלות'}</span>
    </article>
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

function ItemCard({ item, coins, kind, equipped, onNotify }: { item: Collectible; coins: number; kind: CollectibleKind; equipped: { hat?: string; theme?: string }; onNotify: (message: string) => void }) {
  const owned = ownsCollectible(item.id) || item.cost === 0;
  const isEquipped = (kind === 'hat' && equipped.hat === item.id) || (kind === 'theme' && (equipped.theme ?? 'theme.day') === item.id);
  const canEquip = kind === 'hat' || kind === 'theme';

  function act() {
    if (!owned) {
      if (!buyCollectible(item)) {
        onNotify('עוד קצת מטבעות — והפריט הזה שלך!');
        return;
      }
      onNotify(`${item.name} נוסף לאוסף שלך!`);
    }
    if (canEquip) equipCosmetic(kind as 'hat' | 'theme', item.id);
  }

  return (
    <div className={`ml-collection-card${isEquipped ? ' is-equipped' : ''}`}>
      <div className="ml-collection-card__visual">
        <ItemVisual item={item} kind={kind} />
      </div>
      <strong>{item.name}</strong>
      <button
        className={`ml-collection-card__action${isEquipped ? ' is-equipped' : ''}`}
        onClick={act}
        disabled={owned && !canEquip}
        data-state={isEquipped ? 'equipped' : owned ? 'owned' : coins >= item.cost ? 'available' : 'locked'}
      >
        {isEquipped ? 'נבחר ✓' : owned ? (canEquip ? 'בחר' : 'בבעלותך') : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{item.cost} <Coin size={14} /></span>
        )}
      </button>
    </div>
  );
}
