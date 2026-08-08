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
import { getActiveProfile, getActiveProfileId, logoutProfile, useProfiles, useStore } from './state/store';
import type { LandId } from './types';

type Screen =
  | { name: 'start' }
  | { name: 'profile' }
  | { name: 'map' }
  | { name: 'session'; landFocus?: LandId }
  | { name: 'treasure'; result: JourneyResult }
  | { name: 'parent' }
  | { name: 'achievements' }
  | { name: 'collections' };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'start' });
  const soundEffects = useStore((s) => s.settings.soundEffects);
  const voiceName = useStore((s) => s.settings.voiceName);
  useProfiles((registry) => registry.activeId);
  const activeProfile = getActiveProfile();

  // מסנכרן הגדרות אודיו עם המנועים
  useEffect(() => {
    setSfxEnabled(soundEffects);
  }, [soundEffects]);
  useEffect(() => {
    setPreferredVoiceName(voiceName);
  }, [voiceName]);

  // אחרי מסך הפתיחה: אם אין פרופיל פעיל — בחירת משתמש; אחרת ישר למפה.
  function afterStart() {
    setScreen(getActiveProfileId() ? { name: 'map' } : { name: 'profile' });
  }

  function switchProfile() {
    logoutProfile();
    setScreen({ name: 'profile' });
  }

  switch (screen.name) {
    case 'start':
      return <StartTapScreen onStart={afterStart} playerName={activeProfile?.name} />;

    case 'profile':
      return <ProfileScreen onReady={() => setScreen({ name: 'map' })} />;

    case 'map':
      return (
        <MapScreen
          onStartJourney={() => setScreen({ name: 'session' })}
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
          onFinish={(result) => setScreen({ name: 'treasure', result })}
          onQuit={() => setScreen({ name: 'map' })}
        />
      );

    case 'treasure':
      return <TreasureScreen result={screen.result} onHome={() => setScreen({ name: 'map' })} />;

    case 'parent':
      return <ParentDashboard onExit={() => setScreen({ name: 'map' })} />;

    case 'achievements':
      return <AchievementsScreen onExit={() => setScreen({ name: 'map' })} />;

    case 'collections':
      return <CollectionsScreen onExit={() => setScreen({ name: 'map' })} />;
  }
}
