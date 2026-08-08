/* מסך הבית — מפת ממו לנד: שביל מתפתל עם אבנים שמחבר בין הארצות,
   אמבלמה תמטית לכל ארץ, סרגל הישגים עליון, וכפתור "המסע של היום". */
import { getActiveProfile, getTodayPoints, useProfiles, useStore } from '../state/store';
import { LAND_ORDER, LANDS, TRACKS_PER_LAND, landColor } from '../config/lands';
import { playableLands } from '../engines';
import { Button } from '../components/Button';
import { LandIcon } from '../components/svg/LandIcon';
import { HomeBackground } from '../components/svg/Backgrounds';
import { FlagIcon } from '../components/svg/Icons';
import { PlayerHUD } from '../components/world/PlayerHUD';
import { THEME_GRADIENT } from '../config/collectibles';
import type { LandId } from '../types';
import '../components/world/world-map.css';

export function MapScreen({
  onStartJourney,
  onPlayLand,
  onOpenParent,
  onSwitchProfile,
  onOpenAchievements,
  onOpenCollections,
}: {
  onStartJourney: () => void;
  onPlayLand: (land: LandId) => void;
  onOpenParent: () => void;
  onSwitchProfile: () => void;
  onOpenAchievements: () => void;
  onOpenCollections: () => void;
}) {
  const coins = useStore((s) => s.coins);
  const rank = useStore((s) => s.rank);
  const lands = useStore((s) => s.lands);
  const equipped = useStore((s) => s.equipped);
  useStore((s) => s.todayPoints); // רה-רנדר כשמשתנה
  useProfiles((r) => r.activeId);
  const profile = getActiveProfile();
  const playable = playableLands();
  const todayPoints = getTodayPoints();
  const themeBg = THEME_GRADIENT[equipped.theme ?? 'theme.day'] ?? THEME_GRADIENT['theme.day'];
  const useSceneBg = (equipped.theme ?? 'theme.day') === 'theme.day';

  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: useSceneBg ? '#8fd8ff' : themeBg }}>
      {/* רקע נוף מתגלגל (בערכת "יום"); בערכות אחרות — גרדיאנט הערכה */}
      {useSceneBg && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <HomeBackground />
        </div>
      )}
      <header className="ml-map-hud-shell">
        <PlayerHUD
          profile={profile}
          coins={coins}
          rank={rank}
          todayPoints={todayPoints}
          equippedHat={equipped.hat}
          onSwitchProfile={onSwitchProfile}
          onOpenAchievements={onOpenAchievements}
          onOpenCollections={onOpenCollections}
          onOpenParent={onOpenParent}
        />
      </header>

      {/* השביל המתפתל */}
      <div style={{ position: 'relative', padding: '18px 0 24px' }}>
        {/* קו השביל המקווקו מאחורי הכרטיסים */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <path
            d={buildTrailPath(LAND_ORDER.length)}
            fill="none"
            stroke="rgba(255,255,255,.75)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="0.5 9"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {LAND_ORDER.map((id, i) => {
          const meta = LANDS[id];
          const prog = lands[id];
          const isPlayable = playable.includes(id);
          const side = i % 2 === 0 ? 'flex-start' : 'flex-end';
          const color = landColor(id);
          return (
            <div key={id} style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: side, padding: '0 20px', margin: '12px 0' }}>
              <button
                onClick={() => isPlayable && onPlayLand(id)}
                disabled={!isPlayable}
                style={{
                  position: 'relative',
                  width: 268,
                  maxWidth: '82%',
                  background: 'var(--panel)',
                  border: `4px solid ${color}`,
                  borderRadius: 20,
                  padding: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow: '0 5px 0 rgba(36,50,71,.25)',
                  opacity: isPlayable ? 1 : 0.78,
                  cursor: isPlayable ? 'pointer' : 'default',
                  textAlign: 'start',
                }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <LandIcon land={id} size={62} />
                  {prog.castleOpen && (
                    <span style={{ position: 'absolute', insetInlineEnd: -6, top: -6, fontSize: 20 }}>🏰</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 18, color }}>{meta.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink)', opacity: 0.7 }}>{meta.subtitle}</div>
                  {isPlayable ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <FlagIcon size={16} />
                      <span className="ltr" style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 13 }}>
                        {prog.completedTracks}/{TRACKS_PER_LAND}
                      </span>
                      <span style={{ fontSize: 12, opacity: 0.6 }}>מסלולים</span>
                    </div>
                  ) : (
                    <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: 'var(--btn-orange)' }}>בקרוב 🚧</div>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* כפתור המסע היומי — צף בתחתית */}
      <div style={{ position: 'sticky', bottom: 0, padding: '12px 16px calc(16px + var(--safe-top))', background: 'linear-gradient(transparent, rgba(88,197,72,.92) 40%)' }}>
        <Button variant="purple" size="lg" block icon="🧠" onClick={onStartJourney}>
          המסע של היום
        </Button>
      </div>
    </div>
  );
}

/** בונה נתיב מתפתל (זיגזג) בין מרכזי הכרטיסים, ב-viewBox 0..100. */
function buildTrailPath(n: number): string {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const x = i % 2 === 0 ? 28 : 72;
    const y = ((i + 0.5) / n) * 100;
    pts.push([x, y]);
  }
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
}
