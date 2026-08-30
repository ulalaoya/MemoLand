/* מסך המסע היומי — מריץ את רשימת הפעילויות ומנהל תגמול, הקלה שקטה,
   חזרות במרווחים, והתקדמות. מסתיים תמיד בהצלחה → תיבת האוצר. */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Activity } from '../scheduler/activities';
import {
  buildActivities,
  buildDailySupplementalActivity,
  buildFreePlayActivities,
  shouldAdvanceAfterCompletedIncorrect,
} from '../scheduler/activities';
import { buildDailySession } from '../scheduler/session';
import { dueItems, makeSpacedItem } from '../scheduler/spacedRepetition';
import { clampLevel } from '../config/curriculum';
import { getEngine } from '../engines';
import { landColor, LANDS } from '../config/lands';
import {
  DAILY_GOAL,
  addCoins,
  addMinutes,
  addSpacedItems,
  completeTrack,
  finishDailyJourney,
  getState,
  recordAttempt,
  replaceSpaced,
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
import { Guide, guideKindFor } from '../components/svg/Memo';
import { speak } from '../audio/speech';
import { sfxLevelUp } from '../audio/sfx';
import type { LandId } from '../types';
import { multiplicationCurriculumLevel } from '../learning/multiplicationFacts';
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
}

const MAX_ACTIVITIES = 70; // תקרת ביטחון למספר האתגרים במסע

export function SessionScreen({
  landFocus,
  onFinish,
  onQuit,
}: {
  landFocus?: LandId; // אם מוגדר — משחק חופשי בארץ אחת
  onFinish: (r: JourneyResult) => void;
  onQuit: () => void;
}) {
  const settings = useStore((s) => s.settings);
  const persistedCoins = useStore((s) => s.coins);
  const [idx, setIdx] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [coinReward, setCoinReward] = useState<CoinRewardEvent | null>(null);
  const sessionWrong = useRef(0);
  const stats = useRef({ correct: 0, total: 0, bestSpan: 0 });
  const coinsStart = useRef(getState().coins);
  const genSeed = useRef(Date.now());
  const multiplicationSessionId = useRef(`session-${Date.now().toString(36)}`);
  const rewardSequence = useRef(0);
  const rewardClearTimer = useRef<number | null>(null);
  const sessionBoardRef = useRef<HTMLDivElement>(null);
  // נקודות שנצברו במסע הנוכחי — קובעות את אורך המסע (יעד ~1000 ≈ 20 דק').
  const sessionPoints = useRef(0);

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
  const [activities, setActivities] = useState<Activity[]>(() => {
    const now = Date.now();
    if (landFocus) {
      return buildFreePlayActivities(landFocus);
    }
    const st = getState();
    const due = dueItems(st.spaced, now);
    const session = buildDailySession(st.stats, settings.sessionMinutes, due.length > 0, now);
    return buildActivities(session, due, now).activities;
  });
  // ספירת חזרות על אותו אתגר (retry-until-success) — משנה seed ומקל את הרמה.
  const [retry, setRetry] = useState(0);

  const activity = activities[idx];
  // התקדמות המסע נמדדת לפי הנקודות שנצברו במסע (לא טיימר פנימי).
  const progress = landFocus
    ? activities.length
      ? idx / activities.length
      : 0
    : Math.min(1, sessionPoints.current / DAILY_GOAL);

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
  }, []);

  /** יוצר אתגר-משחק נוסף (סבב הרפתקה) כשעדיין לא הגענו ליעד היומי. */
  function makeExtraRotation(atIndex: number): Activity {
    return buildDailySupplementalActivity(atIndex);
  }

  function next() {
    setRetry(0);
    if (idx + 1 < activities.length) {
      setIdx((i) => i + 1);
      return;
    }
    // סיימנו את המבנה — אם עוד לא הגענו ליעד, מוסיפים סבב ומתקדמים.
    if (!landFocus && sessionPoints.current < DAILY_GOAL && activities.length < MAX_ACTIVITIES) {
      setActivities((a) => [...a, makeExtraRotation(a.length)]);
      setIdx((i) => i + 1);
      return;
    }
    finalize();
  }

  function finalize() {
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
    });
  }

  function handleGameResult(a: Extract<Activity, { kind: 'game' }>, r: GameResult) {
    const coinsBefore = getState().coins;
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
    stats.current.total += 1;
    if (r.correct) {
      stats.current.correct += 1;
      if (r.span) stats.current.bestSpan = Math.max(stats.current.bestSpan, r.span);
      sessionWrong.current = 0;
      // צליל ההצלחה כבר נוגן ברכיב המשחק בזמן התשובה; כאן רק חיווי ויזואלי.
      if (res.leveledUp) showToast('המסלול נעשה תלול יותר! 🔥');
      if (res.coinsGained > 0) {
        sessionPoints.current += res.coinsGained;
        showCoinReward(coinsBefore, coinsAfter);
      }
      next();
    } else {
      if (r.newChallengeAfterIncorrect) {
        sessionWrong.current += 1;
        // בעיר זו שאלה שהושלמה (אחרי ניסיון ישיר + חשיפה, או אחרי רמז).
        // מתקדמים לשאלת העיר הבאה בלי לבנות בניין; כך 20 שאלות אינן 20 הצלחות.
        if (shouldAdvanceAfterCompletedIncorrect(a, r.newChallengeAfterIncorrect)) {
          next();
          return;
        }
        setRetry((n) => n + 1);
        return;
      }
      // טעות: לא מתקדמים — נותנים עוד אתגר מאותו הסוג עד שמצליחים.
      sessionWrong.current += 1;
      if (loseHeartAndMaybePause()) return; // נגמרו לבבות — ממתינים לבחירה
      setRetry((n) => n + 1);
    }
  }

  function handleQuizResult(a: Extract<Activity, { kind: 'quiz' }>, correct: boolean) {
    stats.current.total += 1;
    if (correct) {
      stats.current.correct += 1;
      sessionPoints.current += 8;
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

  function handleReveal() {
    next();
  }

  // הקראה + יצירת פריט חזרה כשמגיעים לפעילות reveal
  useEffect(() => {
    if (!activity) return;
    if (activity.kind === 'reveal') {
      speak(activity.text, settings.speechRate);
      // יוצרים פריט חזרה מושהית לסיפור (לשליפה מחר)
      const story = getStoryQuestion(activity.storyId);
      if (story) {
        addSpacedItems([
          makeSpacedItem(
            { id: `story-${activity.storyId}-${Date.now()}`, landId: 'echoes', kind: 'delayed', payload: story },
            Date.now(),
          ),
        ]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

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
  const isImmersiveChallenge = isEchoChallenge || isNumbersChallenge || isConnectionsChallenge;

  return (
    <div className={`ml-session-screen${isEchoChallenge ? ' ml-session-screen--echo' : ''}${isNumbersChallenge ? ' ml-session-screen--numbers' : ''}${isConnectionsChallenge ? ' ml-session-screen--connections' : ''}`}>
      <LandBackground land={activityLand} />

      <header className="ml-session-hud">
        <div className="ml-session-hud__top-row">
          <button
            onClick={onQuit}
            aria-label="חזרה למפה"
            className="ml-session-hud__back ml-pressable"
          >
            <span aria-hidden>→</span>
            <span className="ml-session-hud__back-label">חזרה</span>
          </button>

          <div className="ml-session-hud__progress" aria-label={`התקדמות ${Math.round(progress * 100)} אחוז`}>
            <span style={{ width: `${progress * 100}%`, background: color }} />
          </div>

          <span className="ml-session-hud__guide">
            <Guide kind={guideKindFor(meta.guide)} size={36} />
          </span>
        </div>

        <div className="ml-session-hud__meta-row">
          <div className="ml-session-hud__hearts" aria-label={`${hearts} לבבות`}>
            {Array.from({ length: MAX_HEARTS }).map((_, i) => (
              <span key={i} style={{ animation: hearts === i ? 'wiggle .4s ease' : undefined }}>
                <HeartIcon size={isImmersiveChallenge ? 20 : 24} empty={i >= hearts} />
              </span>
            ))}
          </div>

          <div className="ml-session-hud__world" style={{ background: color }}>
            {activity.label}
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
        className={`ml-session-board${isEchoChallenge ? ' ml-session-board--echo' : ''}${isNumbersChallenge ? ' ml-session-board--numbers' : ''}${isConnectionsChallenge ? ' ml-session-board--connections' : ''}`}
        style={{ '--ml-session-color': color } as React.CSSProperties}
      >
        {/* key מאלץ remount בכל פעילות ובכל ניסיון חוזר — כדי לאפס state ולתת אתגר חדש */}
        <div key={`${idx}-${retry}`} className="ml-session-board__activity">
          {activity.kind === 'game' && (
            <GameHostForActivity a={activity} color={color} speechRate={settings.speechRate} softenBy={retry} seed={genSeed.current + idx * 100 + retry} onResult={(r) => handleGameResult(activity, r)} />
          )}
          {activity.kind === 'quiz' && (
            <QuizGame question={activity.question} answer={activity.answer} options={activity.options} color={color} speechRate={settings.speechRate} onResult={(c) => handleQuizResult(activity, c)} />
          )}
          {activity.kind === 'reveal' && <RevealCard text={activity.text} color={color} onContinue={handleReveal} onReplay={() => speak(activity.text, settings.speechRate)} />}
          {activity.kind === 'speed' && (
            <SpeedMatchGame
              seconds={activity.seconds}
              color={color}
              onDone={(score) => {
                const reward = score * 2;
                sessionPoints.current += reward;
                const coinsBefore = getState().coins;
                if (reward > 0) {
                  addCoins(reward);
                  showCoinReward(coinsBefore, getState().coins);
                }
                showToast(`אספת ${score}!`);
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
            <Guide kind={guideKindFor(meta.guide)} size={72} />
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 22 }}>נגמרו הלבבות!</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, margin: 0 }}>
              ממו לא מוותר אף פעם 💪 רוצה לנסות שוב?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              <Button variant="green" size="lg" block icon="❤" onClick={revive}>
                כן! 3 לבבות חדשים
              </Button>
              <Button variant="red" block onClick={onQuit}>
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
  onResult,
}: {
  a: Extract<Activity, { kind: 'game' }>;
  color: string;
  speechRate: number;
  softenBy: number;
  seed: number;
  onResult: (r: GameResult) => void;
}) {
  const engine = getEngine(a.exerciseId);
  const currentState = getState();
  const multiplication = currentState.multiplication;
  const level = a.landId === 'connections'
    ? multiplicationCurriculumLevel(multiplication)
    : clampLevel((currentState.stats[a.exerciseId]?.level ?? 1) + a.levelDelta - softenBy);
  const generatedAt = useRef(Date.now()).current;
  const challenge = useMemo(
    () => (engine ? engine.generate(level, seed, { now: generatedAt, multiplication }) : null),
    [engine, generatedAt, level, multiplication, seed],
  );
  if (!engine || !challenge) return <div style={{ textAlign: 'center' }}>האתגר בבנייה 🚧</div>;
  return <GameHost challenge={challenge} color={color} speechRate={speechRate} hintMode={softenBy > 0} onResult={onResult} />;
}

function RevealCard({ text, color, onContinue, onReplay }: { text: string; color: string; onContinue: () => void; onReplay: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: 40 }}>🔒</div>
      <p style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 20 }}>שמור את הסוד בלב — נשאל עליו בסוף המסע</p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 19, lineHeight: 1.6, background: 'var(--gray-100)', padding: 16, borderRadius: 16, border: `2px solid ${color}` }}>{text}</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="orange" onClick={onReplay}>🔊 הקרא שוב</Button>
        <Button variant="green" onClick={onContinue} icon="←">שמרתי</Button>
      </div>
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

/* עזרי תוכן */
import { STORIES } from '../engines/echoesContent';

function getStoryQuestion(storyId: string) {
  const s = STORIES.find((x) => x.id === storyId);
  if (!s) return null;
  const q = s.questions[0];
  return { question: q.q, answer: q.answer, options: q.options };
}
