/* מסך המסע היומי — מריץ את רשימת הפעילויות ומנהל תגמול, הקלה שקטה,
   חזרות במרווחים, והתקדמות. מסתיים תמיד בהצלחה → תיבת האוצר. */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Activity } from '../scheduler/activities';
import { buildActivities } from '../scheduler/activities';
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
import { QuizGame } from '../components/games/QuizGame';
import { SpeedMatchGame } from '../components/games/SpeedMatchGame';
import { Button } from '../components/Button';
import { Coin, HeartIcon } from '../components/svg/Icons';
import { LandBackground } from '../components/svg/Backgrounds';
import { Guide, guideKindFor } from '../components/svg/Memo';
import { speak } from '../audio/speech';
import { sfxCoin, sfxCorrect, sfxLevelUp, sfxSoft } from '../audio/sfx';
import type { LandId } from '../types';

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
  const [idx, setIdx] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const sessionWrong = useRef(0);
  const stats = useRef({ correct: 0, total: 0, bestSpan: 0 });
  const coinsStart = useRef(getState().coins);
  const genSeed = useRef(Date.now());
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
      const list: Activity[] = [];
      const ids = getEnginesForLand(landFocus);
      for (let i = 0; i < 5; i++) {
        list.push({ kind: 'game', exerciseId: ids[i % ids.length], landId: landFocus, levelDelta: 0, label: LANDS[landFocus].name });
      }
      return list;
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

  /** יוצר אתגר-משחק נוסף (סבב הרפתקה) כשעדיין לא הגענו ליעד היומי. */
  function makeExtraRotation(atIndex: number): Activity {
    const lands = getPlayableLands();
    const land = lands[atIndex % lands.length];
    const ids = getEnginesForLand(land);
    const id = ids[atIndex % ids.length];
    return { kind: 'game', exerciseId: id, landId: land, levelDelta: 0, label: 'הרפתקה' };
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

  function handleGameResult(a: Extract<Activity, { kind: 'game' }>, r: { correct: boolean; rtMs: number; span?: number }) {
    const res = recordAttempt({ exerciseId: a.exerciseId, landId: a.landId, correct: r.correct, rtMs: r.rtMs, span: r.span });
    stats.current.total += 1;
    if (r.correct) {
      stats.current.correct += 1;
      if (r.span) stats.current.bestSpan = Math.max(stats.current.bestSpan, r.span);
      sessionWrong.current = 0;
      if (res.leveledUp) {
        sfxLevelUp();
        showToast('המסלול נעשה תלול יותר! 🔥');
      } else {
        sfxCorrect();
      }
      if (res.coinsGained > 0) {
        sessionPoints.current += res.coinsGained;
        sfxCoin();
        showToast(`+${res.coinsGained} מטבעות`);
      }
      next();
    } else {
      // טעות: לא מתקדמים — נותנים עוד אתגר מאותו הסוג עד שמצליחים.
      sessionWrong.current += 1;
      sfxSoft();
      if (loseHeartAndMaybePause()) return; // נגמרו לבבות — ממתינים לבחירה
      setRetry((n) => n + 1);
    }
  }

  function handleQuizResult(a: Extract<Activity, { kind: 'quiz' }>, correct: boolean) {
    stats.current.total += 1;
    if (correct) {
      stats.current.correct += 1;
      sessionPoints.current += 8;
      addCoins(8);
      sfxCoin();
      showToast('+8 מטבעות');
    } else {
      sfxSoft();
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

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <LandBackground land={activityLand} />

      {/* כותרת השלב */}
      <div style={{ position: 'relative', zIndex: 2, paddingTop: 'calc(10px + var(--safe-top))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px' }}>
          <button
            onClick={onQuit}
            aria-label="חזרה למפה"
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--panel)', border: '2px solid var(--gray-300)', borderRadius: 999, height: 40, padding: '0 14px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}
          >
            <span style={{ fontSize: 18 }}>→</span> חזרה
          </button>
          <div style={{ flex: 1, height: 14, background: 'rgba(255,255,255,.6)', borderRadius: 999, overflow: 'hidden', border: '2px solid #fff' }}>
            <div style={{ width: `${progress * 100}%`, height: '100%', background: color, transition: 'width .4s' }} />
          </div>
          <Guide kind={guideKindFor(meta.guide)} size={38} />
        </div>

        {/* לבבות המסע */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }} aria-label={`${hearts} לבבות`}>
          {Array.from({ length: MAX_HEARTS }).map((_, i) => (
            <span key={i} style={{ animation: hearts === i ? 'wiggle .4s ease' : undefined, filter: 'drop-shadow(0 2px 2px rgba(36,50,71,.25))' }}>
              <HeartIcon size={28} empty={i >= hearts} />
            </span>
          ))}
        </div>

        <div
          style={{
            margin: '10px auto',
            width: 'fit-content',
            background: color,
            color: '#fff',
            fontFamily: 'var(--font-head)',
            fontWeight: 700,
            padding: '6px 18px',
            borderRadius: 999,
            border: '2px solid #fff',
            boxShadow: 'var(--btn-shadow)',
          }}
        >
          {activity.label}
        </div>
      </div>

      {/* לוח המשחק */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          margin: '6px 12px',
          background: 'rgba(255,255,255,.94)',
          borderRadius: 24,
          border: `3px solid ${color}`,
          padding: '20px 16px',
          minHeight: 380,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxShadow: '0 6px 0 rgba(36,50,71,.2)',
        }}
      >
        {/* key מאלץ remount בכל פעילות ובכל ניסיון חוזר — כדי לאפס state ולתת אתגר חדש */}
        <div key={`${idx}-${retry}`} style={{ width: '100%' }}>
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
                sessionPoints.current += score * 2;
                addCoins(score * 2);
                if (score > 0) sfxCoin();
                showToast(`אספת ${score}! +${score * 2} מטבעות`);
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
          <div style={{ background: 'var(--ink)', color: '#fff', padding: '10px 18px', borderRadius: 999, display: 'flex', gap: 8, alignItems: 'center', fontFamily: 'var(--font-head)', fontWeight: 700, animation: 'pop .3s ease' }}>
            <Coin size={22} spin />
            {toast}
          </div>
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
  onResult: (r: { correct: boolean; rtMs: number; span?: number }) => void;
}) {
  const engine = getEngine(a.exerciseId);
  const level = clampLevel((getState().stats[a.exerciseId]?.level ?? 1) + a.levelDelta - softenBy);
  const challenge = useMemo(() => (engine ? engine.generate(level, seed) : null), [engine, level, seed]);
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
import { enginesForLand as _enginesForLand, playableLands as _playableLands } from '../engines';

function getStoryQuestion(storyId: string) {
  const s = STORIES.find((x) => x.id === storyId);
  if (!s) return null;
  const q = s.questions[0];
  return { question: q.q, answer: q.answer, options: q.options };
}

function getEnginesForLand(land: LandId): string[] {
  return _enginesForLand(land).map((e) => e.id);
}

function getPlayableLands(): LandId[] {
  return _playableLands();
}
