/* מסך המסע היומי — מריץ את רשימת הפעילויות ומנהל תגמול, הקלה שקטה,
   חזרות במרווחים, והתקדמות. מסתיים תמיד בהצלחה → תיבת האוצר. */
import { useEffect, useRef, useState } from 'react';
import type { Activity } from '../scheduler/activities';
import {
  buildActivities,
  buildDailySupplementalActivity,
  buildFreePlayActivities,
  shouldAdvanceAfterCompletedIncorrect,
} from '../scheduler/activities';
import { buildDailySession } from '../scheduler/session';
import { dueItems } from '../scheduler/spacedRepetition';
import { clampLevel } from '../config/curriculum';
import { getEngine } from '../engines';
import { landColor, LANDS } from '../config/lands';
import {
  DAILY_GOAL,
  JOURNEY_SECRET_REWARD,
  addCoins,
  addMinutes,
  answerDailyJourneySecret,
  completeTrack,
  finishDailyJourney,
  getDailyJourneyProgress,
  getState,
  markDailyJourneySecretRevealed,
  recordAttempt,
  rememberChallengeFingerprint,
  replaceSpaced,
  setDailyJourneyActivity,
  setDailyJourneyPlan,
  setDailyJourneyPoints,
  startDailyJourneySecretRecall,
  updateSettings,
  useProfiles,
  useStore,
} from '../state/store';
import { advanceOnSuccess, regressOnFailure } from '../scheduler/spacedRepetition';
import { GameHost } from '../components/games/GameHost';
import type { GameResult } from '../components/games/common';
import { QuizGame } from '../components/games/QuizGame';
import { SpeedMatchGame } from '../components/games/SpeedMatchGame';
import { Button } from '../components/Button';
import { HeartIcon } from '../components/svg/Icons';
import {
  CoinRewardExperience,
  createCoinRewardEvent,
  type CoinRewardEvent,
} from '../components/CoinRewardExperience';
import { LandBackground } from '../components/svg/Backgrounds';
import { Character } from '../components/svg/Memo';
import { speak } from '../audio/speech';
import { sfxLevelUp } from '../audio/sfx';
import type { JourneySecret, LandId } from '../types';
import {
  MULTIPLICATION_PRACTICE_FACTS,
  isMultiplicationFactMastered,
  multiplicationCurriculumLevel,
  multiplicationMasteryCount,
} from '../learning/multiplicationFacts';
import { challengeFingerprint, generateVariedChallenge } from '../engines/variety';
import './session-screen.css';

interface JourneyResult {
  coinsStart: number;
  coinsEnd: number;
  correct: number;
  total: number;
  bestSpan: number;
  streakDays: number;
  castleOpened: boolean;
  reachedGoal: boolean;
  completionKind: 'daily' | 'world';
  landId: LandId;
}

const MAX_ACTIVITIES = 70; // תקרת ביטחון למספר האתגרים במסע
const WORLD_ICONS: Record<LandId, string> = {
  numbers: '🔢',
  echoes: '💧',
  connections: '🏙️',
  forest: '🌳',
  patterns: '🔮',
  speed: '🏁',
  cars: '🚘',
  castle: '🏰',
};

export function SessionScreen({
  landFocus,
  multiplicationPractice = false,
  onFinish,
  onQuit,
}: {
  landFocus?: LandId; // אם מוגדר — משחק חופשי בארץ אחת
  multiplicationPractice?: boolean;
  onFinish: (r: JourneyResult) => void;
  onQuit: () => void;
}) {
  const settings = useStore((s) => s.settings);
  const activeAvatar = useProfiles((registry) => (
    registry.profiles.find((profile) => profile.id === registry.activeId)?.avatar ?? 'memo'
  ));
  const persistedCoins = useStore((s) => s.coins);
  const multiplicationProgress = useStore((s) => s.multiplication);
  const journeySecret = useStore((s) => s.dailyJourney.secret);
  const practiceMode = multiplicationPractice;
  const masteredCount = multiplicationMasteryCount(multiplicationProgress);
  const missionTotal = MULTIPLICATION_PRACTICE_FACTS.length;
  const initialRunRef = useRef<{
    activities: Activity[];
    currentActivity: number;
    seed: number;
    earnedPoints: number;
  } | null>(null);
  if (initialRunRef.current === null) {
    const now = Date.now();
    if (practiceMode) {
      initialRunRef.current = {
        activities: [{
          kind: 'game',
          exerciseId: 'connections.practice',
          landId: 'connections',
          levelDelta: 0,
          label: 'תרגול לוח הכפל',
        }],
        currentActivity: 0,
        seed: now,
        earnedPoints: 0,
      };
    } else if (landFocus) {
      initialRunRef.current = {
        activities: buildFreePlayActivities(landFocus),
        currentActivity: 0,
        seed: now,
        earnedPoints: 0,
      };
    } else {
      const journey = getDailyJourneyProgress(now);
      const st = getState();
      const seed = journey.seed || now;
      const due = dueItems(st.spaced, now);
      const session = buildDailySession(st.stats, settings.sessionMinutes, due.length > 0, seed);
      const activities = journey.plan.length > 0
        ? journey.plan
        : buildActivities(session, due, seed).activities;
      initialRunRef.current = {
        activities,
        currentActivity: Math.min(journey.currentActivity, Math.max(0, activities.length - 1)),
        seed,
        earnedPoints: journey.earnedPoints,
      };
    }
  }
  const initialRun = initialRunRef.current!;
  const [idx, setIdx] = useState(initialRun.currentActivity);
  const [toast, setToast] = useState<string | null>(null);
  const [coinReward, setCoinReward] = useState<CoinRewardEvent | null>(null);
  const sessionWrong = useRef(0);
  const stats = useRef({ correct: 0, total: 0, bestSpan: 0 });
  const coinsStart = useRef(getState().coins);
  const genSeed = useRef(initialRun.seed);
  const multiplicationSessionId = useRef(`session-${Date.now().toString(36)}`);
  const practiceStartedAt = useRef(Date.now());
  const rewardSequence = useRef(0);
  const rewardClearTimer = useRef<number | null>(null);
  const finishTimer = useRef<number | null>(null);
  const finalizingRef = useRef(false);
  const sessionBoardRef = useRef<HTMLDivElement>(null);
  // נקודות שנצברו במסע הנוכחי — קובעות את אורך המסע (יעד ~1000 ≈ 20 דק').
  const sessionPoints = useRef(initialRun.earnedPoints);
  const isDailyJourney = !landFocus && !practiceMode;
  const resumeAfterSecretAnswer = useRef(
    isDailyJourney && journeySecret?.recallStarted === true && journeySecret.answered,
  );

  // מנגנון הלבבות — 3 לבבות למסע; טעות מורידה לב. באפס: "רוצה לנסות שוב?"
  const MAX_HEARTS = 3;
  const heartsRef = useRef(MAX_HEARTS);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [reviveOpen, setReviveOpen] = useState(false);

  /** מוריד לב; מחזיר true אם נגמרו (ואז יש להשהות עד שהילד בוחר). */
  function loseHeartAndMaybePause(): boolean {
    const remaining = heartsRef.current - 1;
    heartsRef.current = remaining;
    setHearts(remaining);
    if (remaining <= 0) {
      setReviveOpen(true);
      return true;
    }
    return false;
  }

  /** "לנסות שוב" — ממלא לבבות וממשיך לנסות את אותו האתגר (בלי איבוד התקדמות). */
  function revive() {
    heartsRef.current = MAX_HEARTS;
    setHearts(MAX_HEARTS);
    setReviveOpen(false);
    sfxLevelUp();
    setRetry((n) => n + 1); // אתגר חדש מאותו הסוג, מעט קל יותר
  }

  // בונים את הפעילויות ההתחלתיות פעם אחת; אפשר להוסיף סבבים עד היעד היומי.
  const [activities, setActivities] = useState<Activity[]>(initialRun.activities);
  // ספירת חזרות על אותו אתגר (retry-until-success) — משנה seed ומקל את הרמה.
  const [retry, setRetry] = useState(0);

  const activity = activities[idx];
  // התקדמות המסע נמדדת לפי הנקודות שנצברו במסע (לא טיימר פנימי).
  const progress = practiceMode
    ? masteredCount / missionTotal
    : landFocus
    ? activities.length
      ? idx / activities.length
      : 0
    : Math.min(1, sessionPoints.current / DAILY_GOAL);

  useEffect(() => {
    if (!landFocus && getDailyJourneyProgress().plan.length === 0) {
      setDailyJourneyPlan(activities);
    }
    // Initial plan only; subsequent extensions are persisted in next().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addSessionPoints(points: number) {
    sessionPoints.current += points;
    if (!landFocus) setDailyJourneyPoints(sessionPoints.current);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1100);
  }

  function showCoinReward(from: number, to: number) {
    rewardSequence.current += 1;
    const event = createCoinRewardEvent(rewardSequence.current, from, to);
    if (!event) return;
    setCoinReward(event);
    if (rewardClearTimer.current !== null) window.clearTimeout(rewardClearTimer.current);
    rewardClearTimer.current = window.setTimeout(() => setCoinReward(null), 920);
  }

  useEffect(() => () => {
    if (rewardClearTimer.current !== null) window.clearTimeout(rewardClearTimer.current);
    if (finishTimer.current !== null) window.clearTimeout(finishTimer.current);
  }, []);

  useEffect(() => {
    if (resumeAfterSecretAnswer.current) finalize();
    // Only recovery after a refresh between answering and reaching the treasure screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** יוצר אתגר-משחק נוסף (סבב הרפתקה) כשעדיין לא הגענו ליעד היומי. */
  function makeExtraRotation(atIndex: number): Activity {
    return buildDailySupplementalActivity(atIndex);
  }

  function next() {
    if (practiceMode) {
      setRetry((current) => current + 1);
      return;
    }
    setRetry(0);
    const nextIndex = idx + 1;
    if (nextIndex < activities.length) {
      if (!landFocus) setDailyJourneyActivity(nextIndex);
      setIdx(nextIndex);
      return;
    }
    // סיימנו את המבנה — אם עוד לא הגענו ליעד, מוסיפים סבב ומתקדמים.
    if (!landFocus && sessionPoints.current < DAILY_GOAL && activities.length < MAX_ACTIVITIES) {
      const extended = [...activities, makeExtraRotation(activities.length)];
      setActivities(extended);
      setDailyJourneyPlan(extended);
      setDailyJourneyActivity(idx + 1);
      setIdx((i) => i + 1);
      return;
    }
    if (isDailyJourney) {
      const secret = getDailyJourneyProgress().secret;
      if (secret && !secret.answered) {
        startDailyJourneySecretRecall();
        return;
      }
    }
    finalize();
  }

  function finalize() {
    if (isDailyJourney) {
      const journey = getDailyJourneyProgress();
      if (journey.status === 'completed') return;
      if (journey.secret && !journey.secret.answered) {
        startDailyJourneySecretRecall();
        return;
      }
    }
    if (finalizingRef.current) return;
    finalizingRef.current = true;
    addMinutes(settings.sessionMinutes);
    const streakRes = landFocus ? { streakDays: getState().streakDays } : finishDailyJourney();
    const focusLand: LandId = landFocus ?? 'numbers';
    const trackRes = completeTrack(focusLand);
    onFinish({
      coinsStart: coinsStart.current,
      coinsEnd: getState().coins,
      correct: stats.current.correct,
      total: stats.current.total,
      bestSpan: stats.current.bestSpan,
      streakDays: streakRes.streakDays,
      castleOpened: trackRes.castleOpened,
      reachedGoal: !landFocus && sessionPoints.current >= DAILY_GOAL,
      completionKind: isDailyJourney ? 'daily' : 'world',
      landId: focusLand,
    });
  }

  function handleSecretAnswer(selected: string) {
    const result = answerDailyJourneySecret(selected);
    if (!result.accepted) return;
    stats.current.total += 1;
    if (result.correct) stats.current.correct += 1;
    sessionPoints.current += result.rewardCoins;
    finishTimer.current = window.setTimeout(finalize, 1700);
  }

  function quit() {
    if (practiceMode) {
      const completedMinutes = Math.floor((Date.now() - practiceStartedAt.current) / 60_000);
      if (completedMinutes > 0) addMinutes(completedMinutes);
    }
    const current = activities[idx];
    const returnLand = current && 'landId' in current ? current.landId : landFocus;
    if (returnLand) {
      try {
        sessionStorage.setItem('memoland.map-return-land', returnLand);
      } catch {
        // Navigation still works if storage is unavailable.
      }
    }
    onQuit();
  }

  function handleGameResult(a: Extract<Activity, { kind: 'game' }>, r: GameResult) {
    const coinsBefore = getState().coins;
    const masteryBefore = getState().multiplication;
    const res = recordAttempt({
      exerciseId: a.exerciseId,
      landId: a.landId,
      correct: r.correct,
      rtMs: r.rtMs,
      span: r.span,
      multiplicationAttempts: r.multiplicationAttempts?.map((attempt) => ({
        ...attempt,
        sessionId: multiplicationSessionId.current,
        sessionContext: landFocus ? 'free-play' : 'daily',
      })),
    });
    const coinsAfter = getState().coins;
    const newMasteredFact = practiceMode && r.multiplicationAttempts?.find((attempt) =>
      !isMultiplicationFactMastered(masteryBefore, attempt.factId)
      && isMultiplicationFactMastered(getState().multiplication, attempt.factId)
    );
    stats.current.total += 1;
    if (r.correct) {
      stats.current.correct += 1;
      if (r.span) stats.current.bestSpan = Math.max(stats.current.bestSpan, r.span);
      sessionWrong.current = 0;
      // צליל ההצלחה כבר נוגן ברכיב המשחק בזמן התשובה; כאן רק חיווי ויזואלי.
      if (newMasteredFact) {
        const [aFactor, bFactor] = newMasteredFact.factId.split('x');
        showToast(`✨ ${aFactor} × ${bFactor} הושלמה! ${multiplicationMasteryCount(getState().multiplication)}/${missionTotal}`);
      } else if (res.leveledUp) {
        showToast('המסלול נעשה תלול יותר! 🔥');
      }
      if (res.coinsGained > 0) {
        addSessionPoints(res.coinsGained);
        showCoinReward(coinsBefore, coinsAfter);
      }
      next();
    } else {
      if (r.newChallengeAfterIncorrect) {
        sessionWrong.current += 1;
        if (practiceMode) {
          next();
          return;
        }
        // בעיר זו שאלה שהושלמה (אחרי ניסיון ישיר + חשיפה, או אחרי רמז).
        // מתקדמים לשאלת העיר הבאה בלי לבנות חלק; רק תשובה נכונה מקדמת את הפרויקט.
        if (shouldAdvanceAfterCompletedIncorrect(a, r.newChallengeAfterIncorrect, isDailyJourney)) {
          next();
          return;
        }
        setRetry((n) => n + 1);
        return;
      }
      // טעות: לא מתקדמים — נותנים עוד אתגר מאותו הסוג עד שמצליחים.
      sessionWrong.current += 1;
      if (practiceMode) {
        setRetry((n) => n + 1);
        return;
      }
      if (loseHeartAndMaybePause()) return; // נגמרו לבבות — ממתינים לבחירה
      setRetry((n) => n + 1);
    }
  }

  function handleQuizResult(a: Extract<Activity, { kind: 'quiz' }>, correct: boolean) {
    stats.current.total += 1;
    if (correct) {
      stats.current.correct += 1;
      addSessionPoints(8);
      const coinsBefore = getState().coins;
      addCoins(8);
      showCoinReward(coinsBefore, getState().coins);
    }
    // עדכון חזרות במרווחים לפריט מאתמול
    if (a.spacedId) {
      const now = Date.now();
      const st = getState();
      const item = st.spaced.find((x) => x.id === a.spacedId);
      if (item) {
        const updated = correct ? advanceOnSuccess(item, now) : regressOnFailure(item, now);
        const rest = st.spaced.filter((x) => x.id !== a.spacedId);
        replaceSpaced(updated ? [...rest, updated] : rest);
      }
    }
    if (!correct && loseHeartAndMaybePause()) return;
    next();
  }

  if (isDailyJourney && journeySecret && !journeySecret.revealed) {
    return (
      <JourneySecretScreen
        secret={journeySecret}
        speechRate={settings.speechRate}
        onRevealDone={markDailyJourneySecretRevealed}
        onAnswer={handleSecretAnswer}
      />
    );
  }

  if (isDailyJourney && journeySecret?.recallStarted) {
    return (
      <JourneySecretScreen
        secret={journeySecret}
        speechRate={settings.speechRate}
        onRevealDone={markDailyJourneySecretRevealed}
        onAnswer={handleSecretAnswer}
      />
    );
  }

  if (!activity) {
    // אין פעילויות (מקרה קצה) — מסיימים בהצלחה
    return (
      <CenterScreen land={landFocus ?? 'numbers'}>
        <Button variant="green" size="lg" onClick={finalize}>
          לתיבת האוצר
        </Button>
      </CenterScreen>
    );
  }

  const activityLand: LandId = 'landId' in activity ? activity.landId : 'echoes';
  const color = landColor(activityLand);
  const meta = LANDS[activityLand];
  const isEchoChallenge = activity.kind === 'game' && activityLand === 'echoes';
  const isNumbersChallenge = activity.kind === 'game' && activityLand === 'numbers';
  const isConnectionsChallenge = activity.kind === 'game' && activityLand === 'connections';
  const isCarsChallenge = activity.kind === 'game' && activityLand === 'cars';
  const isImmersiveChallenge = isEchoChallenge || isNumbersChallenge || isConnectionsChallenge || isCarsChallenge;
  const completedCityQuestions = isDailyJourney
    ? activities.slice(0, idx).filter((item) => item.kind === 'game' && item.landId === 'connections').length
    : undefined;
  const cityPuzzleProject = Math.abs(Math.floor(initialRun.seed / 86_400_000)) % 30;
  const showWorldPreparation = activity.kind === 'game'
    && activity.landId === 'forest'
    && retry === 0
    && !activities.slice(0, idx).some((item) => item.kind === 'game' && item.landId === 'forest');

  return (
    <div className={`ml-session-screen ml-session-screen--${activityLand}${practiceMode ? ' ml-session-screen--multiplication-practice' : ''}`}>
      <LandBackground land={activityLand} />

      <header className="ml-session-hud">
        <div className="ml-session-hud__top-row">
          <button
            onClick={quit}
            aria-label={practiceMode ? 'סיימתי לתרגל, חזרה למפה' : 'חזרה למפה'}
            className="ml-session-hud__back ml-pressable"
          >
            <span aria-hidden>→</span>
            <span className="ml-session-hud__back-label">{practiceMode ? 'סיימתי להיום' : 'חזרה'}</span>
          </button>

          <div className="ml-session-hud__progress" aria-label={`התקדמות ${Math.round(progress * 100)} אחוז`}>
            <span style={{ width: `${progress * 100}%`, background: color }} />
          </div>

          <span className="ml-session-hud__guide">
            <Character kind={activeAvatar} size={36} />
          </span>

          <button
            type="button"
            className="ml-session-hud__mute ml-pressable"
            aria-label={settings.soundEffects ? 'השתק צלילים' : 'הפעל צלילים'}
            aria-pressed={!settings.soundEffects}
            onClick={() => updateSettings({ soundEffects: !settings.soundEffects })}
          >
            <span aria-hidden>{settings.soundEffects ? '🔊' : '🔇'}</span>
          </button>
        </div>

        <div className="ml-session-hud__meta-row">
          {!practiceMode && <div className="ml-session-hud__hearts" aria-label={`${hearts} לבבות`}>
            {Array.from({ length: MAX_HEARTS }).map((_, i) => (
              <span key={i} style={{ animation: hearts === i ? 'wiggle .4s ease' : undefined }}>
                <HeartIcon size={isImmersiveChallenge ? 20 : 24} empty={i >= hearts} />
              </span>
            ))}
          </div>}

          <div className="ml-session-hud__world" style={{ background: color }}>
            <span className="ml-session-hud__world-icon" aria-hidden>{WORLD_ICONS[activityLand]}</span>
            <span className="ml-session-hud__world-copy">
              <strong>{meta.name}</strong>
              {practiceMode ? (
                <small>{masteredCount === missionTotal
                  ? `תרגול שימור · ${masteredCount}/${missionTotal}`
                  : `כפל: ${masteredCount}/${missionTotal}`}</small>
              ) : null}
            </span>
          </div>

          <CoinRewardExperience
            total={persistedCoins}
            reward={coinReward}
            sourceRef={sessionBoardRef}
          />
        </div>
      </header>

      <div
        ref={sessionBoardRef}
        className={`ml-session-board ml-session-board--${activityLand}`}
        style={{ '--ml-session-color': color } as React.CSSProperties}
      >
        {/* key מאלץ remount בכל פעילות ובכל ניסיון חוזר — כדי לאפס state ולתת אתגר חדש */}
        <div key={`${idx}-${retry}`} className="ml-session-board__activity">
          {activity.kind === 'game' && (
            <GameHostForActivity
              a={activity}
              color={color}
              speechRate={settings.speechRate}
              softenBy={retry}
              seed={genSeed.current + idx * 100 + retry}
              connectionsProgress={isConnectionsChallenge ? completedCityQuestions : undefined}
              connectionsProjectIndex={isConnectionsChallenge ? cityPuzzleProject : undefined}
              showPreparation={showWorldPreparation}
              onResult={(r) => handleGameResult(activity, r)}
            />
          )}
          {activity.kind === 'quiz' && (
            <QuizGame question={activity.question} answer={activity.answer} options={activity.options} color={color} speechRate={settings.speechRate} onResult={(c) => handleQuizResult(activity, c)} />
          )}
          {activity.kind === 'speed' && (
            <SpeedMatchGame
              seconds={activity.seconds}
              color={color}
              baseLevel={getState().stats['speed.match']?.level ?? 1}
              seed={genSeed.current + idx * 100}
              onDone={(score) => {
                const reward = score * 2;
                addSessionPoints(reward);
                const coinsBefore = getState().coins;
                if (reward > 0) {
                  addCoins(reward);
                  showCoinReward(coinsBefore, getState().coins);
                }
                next();
              }}
            />
          )}
        </div>
      </div>

      {toast && (
        <div
          style={{
            position: 'absolute',
            zIndex: 5,
            bottom: 40,
            insetInline: 0,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ background: 'var(--ink)', color: '#fff', padding: '9px 16px', borderRadius: 999, fontFamily: 'var(--font-head)', fontWeight: 700, animation: 'pop .3s ease' }}>{toast}</div>
        </div>
      )}

      {/* מסך "רוצה לנסות שוב?" — כשנגמרו הלבבות. דחיפה עדינה להצלחה, בלי איבוד. */}
      {reviveOpen && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            background: 'rgba(36,50,71,.6)',
            display: 'grid',
            placeItems: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              background: 'var(--panel)',
              borderRadius: 24,
              border: '4px solid #fff',
              padding: '24px 20px',
              textAlign: 'center',
              maxWidth: 340,
              width: '100%',
              boxShadow: '0 8px 0 rgba(36,50,71,.35)',
              animation: 'pop .35s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 1, 2].map((i) => (
                <HeartIcon key={i} size={34} empty />
              ))}
            </div>
            <Character kind={activeAvatar} size={72} />
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 22 }}>נגמרו הלבבות!</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, margin: 0 }}>
              ממו לא מוותר אף פעם 💪 רוצה לנסות שוב?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              <Button variant="green" size="lg" block icon="❤" onClick={revive}>
                כן! 3 לבבות חדשים
              </Button>
              <Button variant="red" block onClick={quit}>
                חזרה למפה
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* עוטף את GameHost עם יצירת האתגר לפי רמה + הקלה שקטה. */
function GameHostForActivity({
  a,
  color,
  speechRate,
  softenBy,
  seed,
  connectionsProgress,
  connectionsProjectIndex,
  showPreparation,
  onResult,
}: {
  a: Extract<Activity, { kind: 'game' }>;
  color: string;
  speechRate: number;
  softenBy: number;
  seed: number;
  connectionsProgress?: number;
  connectionsProjectIndex?: number;
  showPreparation?: boolean;
  onResult: (r: GameResult) => void;
}) {
  const engine = getEngine(a.exerciseId);
  // The parent key remounts this component only when advancing/retrying.
  // A displayed question must not change when rewards, history or stats update.
  const [challenge] = useState(() => {
    const currentState = getState();
    const multiplication = currentState.multiplication;
    const level = a.landId === 'connections'
      ? clampLevel(multiplicationCurriculumLevel(multiplication) + a.levelDelta - softenBy)
      : clampLevel((currentState.stats[a.exerciseId]?.level ?? 1) + a.levelDelta - softenBy);
    return engine
      ? generateVariedChallenge(
          engine,
          level,
          seed,
          currentState.recentChallengeFingerprints,
          { now: Date.now(), multiplication },
        )
      : null;
  });
  const fingerprint = challenge ? challengeFingerprint(challenge) : '';
  useEffect(() => {
    if (fingerprint) rememberChallengeFingerprint(fingerprint);
  }, [fingerprint]);
  if (!engine || !challenge) return <div style={{ textAlign: 'center' }}>האתגר בבנייה 🚧</div>;
  return (
    <GameHost
      challenge={challenge}
      color={color}
      speechRate={speechRate}
      hintMode={softenBy > 0}
      connectionsProgress={connectionsProgress}
      connectionsProjectIndex={connectionsProjectIndex}
      showPreparation={showPreparation}
      onResult={onResult}
    />
  );
}

function JourneySecretScreen({
  secret,
  speechRate,
  onRevealDone,
  onAnswer,
}: {
  secret: JourneySecret;
  speechRate: number;
  onRevealDone: () => void;
  onAnswer: (selected: string) => void;
}) {
  const avatar = useProfiles((registry) => (
    registry.profiles.find((profile) => profile.id === registry.activeId)?.avatar ?? 'memo'
  ));
  const [chosen, setChosen] = useState<string | null>(secret.answered ? secret.value : null);
  const recalling = secret.recallStarted;

  function choose(option: string) {
    if (chosen !== null || secret.answered) return;
    setChosen(option);
    onAnswer(option);
  }

  return (
    <div className="ml-journey-secret-screen">
      <div className="ml-journey-secret-atmosphere" aria-hidden>
        <span className="ml-journey-secret-star ml-journey-secret-star--one">✦</span>
        <span className="ml-journey-secret-star ml-journey-secret-star--two">✦</span>
        <span className="ml-journey-secret-star ml-journey-secret-star--three">✦</span>
      </div>
      <div className="ml-journey-secret-memo" aria-hidden><Character kind={avatar} size={150} /></div>
      <main className="ml-journey-secret-card" aria-live="polite">
        <div className="ml-journey-secret-lock" aria-hidden><span>{recalling ? '🗝️' : '🔐'}</span></div>
        <span className="ml-journey-secret-eyebrow">סוד המסע</span>
        {!recalling ? (
          <>
            <h1>יש לי סוד קטן בשבילך</h1>
            <p>זכור את {secret.kind === 'word' ? 'המילה' : 'המספר'} עד סוף המסע.</p>
            <strong className="ml-journey-secret-value ltr">{secret.value}</strong>
            <div className="ml-journey-secret-actions">
              <Button variant="orange" onClick={() => speak(secret.value, speechRate)}>🔊 שמע שוב</Button>
              <Button variant="green" size="lg" onClick={onRevealDone} icon="←">זכרתי, יוצאים לדרך</Button>
            </div>
          </>
        ) : (
          <>
            <h1>מה היה סוד המסע?</h1>
            <p>בחר את {secret.kind === 'word' ? 'המילה' : 'המספר'} שפגשת בהתחלה.</p>
            <div className="ml-journey-secret-options">
              {secret.options.map((option) => {
                const answered = chosen !== null || secret.answered;
                const isAnswer = option === secret.value;
                const isChosen = option === chosen;
                return (
                  <button
                    key={option}
                    type="button"
                    className={`${isAnswer && answered ? 'is-correct' : ''}${isChosen && !isAnswer ? ' is-wrong' : ''}`}
                    disabled={answered}
                    onClick={() => choose(option)}
                  >
                    <span className="ltr">{option}</span>
                  </button>
                );
              })}
            </div>
            {(chosen !== null || secret.answered) && (
              <div className={`ml-journey-secret-result ${secret.wasCorrect ? 'is-correct' : 'is-kind-retry'}`}>
                {secret.wasCorrect
                  ? `מצוין! זכרת את סוד המסע וקיבלת ${JOURNEY_SECRET_REWARD} מטבעות.`
                  : `כמעט! סוד המסע היה ${secret.value}. עשית דרך שלמה — כל הכבוד!`}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function CenterScreen({ children, land }: { children: React.ReactNode; land: LandId }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
      <LandBackground land={land} />
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
}
