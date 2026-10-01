/* מסך הבית — מפת ממו לנד: מסלול הרפתקה אנכי שמחבר בין כל הארצות. */
import { DAILY_GOAL, getActiveProfile, getDailyJourneyProgress, getTodayPoints, useProfiles, useStore } from '../state/store';
import { LAND_ORDER, LANDS, TRACKS_PER_LAND } from '../config/lands';
import { playableLands } from '../engines';
import { PlayerHUD } from '../components/world/PlayerHUD';
import { LandCard } from '../components/world/LandCard';
import { DailyJourneyBanner } from '../components/world/DailyJourneyBanner';
import { LAND_THEMES } from '../design/themes';
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
  useStore((s) => s.dailyJourney);
  useProfiles((r) => r.activeId);
  const profile = getActiveProfile();
  const playable = playableLands();
  const todayPoints = getTodayPoints();
  const journey = getDailyJourneyProgress();
  const currentLandIndex = getCurrentLandIndex(playable, lands);

  return (
    <div className="ml-world-map-screen">
      <div className="ml-world-map-scene" aria-hidden />

      <header className="ml-map-hud-shell">
        <PlayerHUD
          profile={profile}
          coins={coins}
          rank={rank}
          equippedHat={equipped.hat}
          onSwitchProfile={onSwitchProfile}
          onOpenAchievements={onOpenAchievements}
          onOpenCollections={onOpenCollections}
          onOpenParent={onOpenParent}
        />
      </header>

      <main className="ml-world-map-main">
        <section className="ml-world-map-hero" aria-label="המסע היומי">
          <DailyJourneyBanner
            todayPoints={todayPoints}
            dailyGoal={DAILY_GOAL}
            status={journey.status}
            currentActivity={journey.currentActivity}
            onStart={onStartJourney}
          />
        </section>

        <section className="ml-world-map-route" aria-label="עולמות ממו לנד">
          <div className="ml-world-map-route__light" aria-hidden />
          <img className="ml-world-map-memo" src="./characters/memo-adventure.png" alt="" aria-hidden draggable={false} />
          <div className="ml-world-map-route__cards">
            {LAND_ORDER.map((id, index) => {
              const meta = LANDS[id];
              const progress = lands[id];
              const available = playable.includes(id);
              return (
                <LandCard
                  key={id}
                  landId={id}
                  worldNumber={index + 1}
                  name={meta.name}
                  subtitle={meta.subtitle}
                  completedTracks={progress.completedTracks}
                  totalTracks={TRACKS_PER_LAND}
                  castleOpen={progress.castleOpen}
                  available={available}
                  current={index === currentLandIndex}
                  side={index % 2 === 0 ? 'left' : 'right'}
                  theme={LAND_THEMES[id]}
                  onSelect={() => available && onPlayLand(id)}
                />
              );
            })}
          </div>
        </section>
      </main>

    </div>
  );
}

function getCurrentLandIndex(playable: LandId[], lands: Record<LandId, { completedTracks: number }>): number {
  const firstIncomplete = LAND_ORDER.findIndex((id) => playable.includes(id) && lands[id].completedTracks < TRACKS_PER_LAND);
  if (firstIncomplete >= 0) return firstIncomplete;
  const reverseIndex = [...LAND_ORDER].reverse().findIndex((id) => playable.includes(id));
  return reverseIndex < 0 ? 0 : LAND_ORDER.length - 1 - reverseIndex;
}
