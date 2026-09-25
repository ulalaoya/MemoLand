import { useEffect, useState } from 'react';
import { StartTapScreen } from './screens/StartTapScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { MapScreen } from './screens/MapScreen';
import { SessionScreen } from './screens/SessionScreen';
import { TreasureScreen, type JourneyResult } from './screens/TreasureScreen';
import { ParentDashboard } from './screens/ParentDashboard';
import { AchievementsScreen } from './screens/AchievementsScreen';
import { CollectionsScreen } from './screens/CollectionsScreen';
import { setSfxEnabled } from './audio/sfx';
import { setPreferredVoiceName } from './audio/speech';
import {
  beginDailyJourney,
  getActiveProfileId,
  getDailyJourneyProgress,
  logoutProfile,
  useStore,
} from './state/store';
import type { LandId } from './types';

type Screen =
  | { name: 'start' }
  | { name: 'profile' }
  | { name: 'map' }
  | { name: 'session'; landFocus?: LandId; multiplicationPractice?: boolean }
  | { name: 'treasure'; result: JourneyResult }
  | { name: 'parent' }
  | { name: 'achievements' }
  | { name: 'collections' };

function initialScreen(): Screen {
  if (!getActiveProfileId()) return { name: 'start' };
  return getDailyJourneyProgress().status === 'in-progress'
    ? { name: 'session' }
    : { name: 'map' };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const soundEffects = useStore((s) => s.settings.soundEffects);
  const voiceName = useStore((s) => s.settings.voiceName);

  // מסנכרן הגדרות אודיו עם המנועים
  useEffect(() => {
    setSfxEnabled(soundEffects);
  }, [soundEffects]);
  useEffect(() => {
    setPreferredVoiceName(voiceName);
  }, [voiceName]);

  function afterStart() {
    setScreen(getActiveProfileId() ? { name: 'map' } : { name: 'profile' });
  }

  function switchProfile() {
    logoutProfile();
    setScreen({ name: 'profile' });
  }

  function startOrResumeJourney() {
    beginDailyJourney();
    setScreen({ name: 'session' });
  }

  switch (screen.name) {
    case 'start':
      return <StartTapScreen onStart={afterStart} />;

    case 'profile':
      return <ProfileScreen onReady={() => setScreen({ name: 'map' })} />;

    case 'map':
      return (
        <MapScreen
          onStartJourney={startOrResumeJourney}
          onPlayLand={(land) => setScreen({ name: 'session', landFocus: land })}
          onOpenParent={() => setScreen({ name: 'parent' })}
          onSwitchProfile={switchProfile}
          onOpenAchievements={() => setScreen({ name: 'achievements' })}
          onOpenCollections={() => setScreen({ name: 'collections' })}
        />
      );

    case 'session':
      return (
        <SessionScreen
          landFocus={screen.landFocus}
          multiplicationPractice={screen.multiplicationPractice}
          onFinish={(result) => setScreen({ name: 'treasure', result })}
          onQuit={() => setScreen({ name: 'map' })}
        />
      );

    case 'treasure':
      return <TreasureScreen result={screen.result} onHome={() => setScreen({ name: 'map' })} />;

    case 'parent':
      return (
        <ParentDashboard
          onExit={() => setScreen({ name: 'map' })}
          onStartMultiplicationPractice={() => setScreen({
            name: 'session',
            landFocus: 'connections',
            multiplicationPractice: true,
          })}
        />
      );

    case 'achievements':
      return <AchievementsScreen onExit={() => setScreen({ name: 'map' })} />;

    case 'collections':
      return <CollectionsScreen onExit={() => setScreen({ name: 'map' })} />;
  }
}
