/* מסך הבית — מפת ממו לנד: מסלול הרפתקה אנכי שמחבר בין כל הארצות. */
import { useEffect } from 'react';
import { DAILY_GOAL, getActiveProfile, getDailyJourneyProgress, useProfiles, useStore } from '../state/store';
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
  const stats = useStore((s) => s.stats);
  const equipped = useStore((s) => s.equipped);
  useStore((s) => s.dailyJourney);
  useProfiles((r) => r.activeId);
  const profile = getActiveProfile();
  const playable = playableLands();
  const journey = getDailyJourneyProgress();
  const currentLandIndex = getCurrentLandIndex(playable, lands);

  useEffect(() => {
    let saved = 0;
    let returnLand: LandId | null = null;
    try {
      saved = Number(sessionStorage.getItem('memoland.map-scroll-y'));
      const storedLand = sessionStorage.getItem('memoland.map-return-land');
      returnLand = storedLand && LAND_ORDER.includes(storedLand as LandId) ? storedLand as LandId : null;
      sessionStorage.removeItem('memoland.map-return-land');
    } catch {
      return;
    }
    const restore = () => {
      const scroller = document.querySelector<HTMLElement>('.ml-world-map-screen');
      const target = returnLand
        ? document.querySelector<HTMLElement>(`.ml-land-row[data-land="${returnLand}"]`)
        : null;
      if (target && scroller) {
        const targetTop = target.offsetTop - Math.max(0, (scroller.clientHeight - target.offsetHeight) / 2);
        scroller.scrollTo({ top: Math.max(0, targetTop), behavior: 'auto' });
      } else if (scroller && Number.isFinite(saved) && saved > 0) {
        scroller.scrollTo({ top: saved, behavior: 'auto' });
      }
    };
    const first = window.requestAnimationFrame(() => window.requestAnimationFrame(restore));
    const afterImages = window.setTimeout(restore, 180);
    return () => {
      window.cancelAnimationFrame(first);
      window.clearTimeout(afterImages);
    };
  }, []);

  const rememberMapPosition = (returnLand?: LandId) => {
    try {
      const scroller = document.querySelector<HTMLElement>('.ml-world-map-screen');
      sessionStorage.setItem('memoland.map-scroll-y', String(scroller?.scrollTop ?? window.scrollY));
      if (returnLand) sessionStorage.setItem('memoland.map-return-land', returnLand);
      else sessionStorage.removeItem('memoland.map-return-land');
    } catch {
      // Private-mode storage can be unavailable; map navigation still works.
    }
  };

  return (
    <div className="ml-world-map-screen">
      <div className="ml-world-map-scene" aria-hidden />

      <header className="ml-map-hud-shell">
        <PlayerHUD
          profile={profile}
          coins={coins}
          rank={rank}
          stats={stats}
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
            todayPoints={journey.earnedPoints}
            dailyGoal={DAILY_GOAL}
            status={journey.status}
            currentActivity={journey.currentActivity}
            onStart={() => {
              rememberMapPosition();
              onStartJourney();
            }}
          />
        </section>

        <section className="ml-world-map-route" aria-label="עולמות ממו לנד">
          <div className="ml-world-map-route__light" aria-hidden />
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
                  onSelect={() => {
                    if (!available) return;
                    rememberMapPosition(id);
                    onPlayLand(id);
                  }}
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
