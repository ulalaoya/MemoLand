import { useEffect, useMemo, useRef, useState } from 'react';
import { speedMatch } from '../../engines/speed';
import { challengeFingerprint, generateVariedChallenge } from '../../engines/variety';
import { clampLevel } from '../../config/curriculum';
import { TapGlyph } from '../svg/TapIcon';
import { sfxCoin, sfxSoft } from '../../audio/sfx';

type ChoiceFlash = { index: number; correct: boolean } | null;

export const SPEED_RACE_SECONDS = 60;
export const SPEED_RACE_FINISH_TITLE = 'סיימת את המרוץ!';
export const speedRaceSummary = (score: number) => `${score} הצלחות בדקה`;

/** The one shared, continuous 60-second race used by Daily Journey and Free Play. */
export function SpeedMatchGame({
  seconds = SPEED_RACE_SECONDS,
  color,
  baseLevel,
  seed,
  onDone,
}: {
  seconds?: number;
  color: string;
  baseLevel: number;
  seed: number;
  onDone: (score: number) => void;
}) {
  const [left, setLeft] = useState(seconds);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [flash, setFlash] = useState<ChoiceFlash>(null);
  const [finished, setFinished] = useState(false);
  const scoreRef = useRef(0);
  const doneRef = useRef(false);
  const choiceLockedRef = useRef(false);
  const nextRoundTimer = useRef<number | null>(null);
  const doneTimer = useRef<number | null>(null);
  const recentFingerprints = useRef<string[]>([]);

  scoreRef.current = score;
  const loadLevel = clampLevel(Math.max(baseLevel, score < 5 ? 1 : score < 12 ? 6 : 11));
  const challenge = useMemo(
    () => generateVariedChallenge(speedMatch, loadLevel, seed + round, recentFingerprints.current),
    [loadLevel, round, seed],
  );

  useEffect(() => {
    const fingerprint = challengeFingerprint(challenge);
    recentFingerprints.current = [
      ...recentFingerprints.current.filter((item) => item !== fingerprint),
      fingerprint,
    ].slice(-3);
  }, [challenge]);

  useEffect(() => {
    const deadline = performance.now() + seconds * 1000;
    const finishRace = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      choiceLockedRef.current = true;
      setLeft(0);
      setFinished(true);
      doneTimer.current = window.setTimeout(() => onDone(scoreRef.current), 2400);
    };
    const updateClock = () => {
      const remainingMs = deadline - performance.now();
      if (remainingMs <= 0) finishRace();
      else setLeft(Math.ceil(remainingMs / 1000));
    };
    const timer = window.setInterval(updateClock, 200);
    updateClock();
    return () => {
      window.clearInterval(timer);
      if (nextRoundTimer.current !== null) window.clearTimeout(nextRoundTimer.current);
      if (doneTimer.current !== null) window.clearTimeout(doneTimer.current);
    };
    // The race lifetime is intentionally fixed at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pick(index: number) {
    if (doneRef.current || choiceLockedRef.current) return;
    choiceLockedRef.current = true;
    const correct = index === challenge.answer;
    setFlash({ index, correct });
    if (correct) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      sfxCoin();
    } else {
      sfxSoft();
    }

    // Only the brief color flash remains; there is no banner or feedback pause.
    nextRoundTimer.current = window.setTimeout(() => {
      if (doneRef.current) return;
      setFlash(null);
      setRound((value) => value + 1);
      choiceLockedRef.current = false;
    }, 120);
  }

  if (finished) {
    return (
      <div
        data-speed-race-finished
        style={{ minHeight: 330, display: 'grid', placeItems: 'center', textAlign: 'center' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, color: 'var(--ink)' }}>
          <span aria-hidden style={{ fontSize: 64 }}>🏁</span>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-head)', fontSize: 30 }}>{SPEED_RACE_FINISH_TITLE}</h2>
          <strong className="ml-number-text" style={{ fontSize: 24 }}>{speedRaceSummary(score)}</strong>
        </div>
      </div>
    );
  }

  return (
    <div
      data-speed-race
      data-option-count={challenge.stimulus.options.length}
      style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', color: 'var(--ink)' }}
    >
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
        <div aria-label={`${score} הצלחות`} style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 19 }}>
          הצלחות: <span className="ml-number-text" style={{ color }}>{score}</span>
        </div>
        <div
          aria-label={`${left} שניות נותרו`}
          style={{
            minWidth: 78,
            padding: '7px 12px',
            borderRadius: 999,
            background: left <= 10 ? '#ffe2df' : 'var(--panel)',
            border: `3px solid ${left <= 10 ? '#d92d20' : color}`,
            color: left <= 10 ? '#9f1b14' : 'var(--ink)',
            fontFamily: 'var(--font-display)',
            fontSize: 25,
            direction: 'ltr',
          }}
        >
          {left}
        </div>
      </div>

      <p style={{ margin: 0, fontFamily: 'var(--font-head)', fontWeight: 700 }}>מצא את הסמל הזהה</p>
      <div
        data-speed-target={challenge.stimulus.target}
        style={{ padding: 14, borderRadius: 18, background: 'var(--panel)', border: `3px solid ${color}` }}
      >
        <TapGlyph id={challenge.stimulus.target} size={72} />
      </div>

      <div style={{ width: '100%', display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {challenge.stimulus.options.map((id, index) => {
          const selected = flash?.index === index;
          const background = selected ? (flash.correct ? '#20a35a' : '#d92d20') : 'var(--panel)';
          return (
            <button
              key={`${round}-${id}`}
              type="button"
              data-speed-option={id}
              onClick={() => pick(index)}
              aria-label={`אפשרות ${index + 1}`}
              style={{
                padding: 11,
                background,
                border: `3px solid ${selected ? '#fff' : 'var(--gray-300)'}`,
                borderRadius: 16,
                boxShadow: '0 3px 0 rgba(36,50,71,.15)',
                transition: 'background 80ms ease',
              }}
            >
              <TapGlyph id={id} size={50} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
