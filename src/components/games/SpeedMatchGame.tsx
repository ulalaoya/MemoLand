import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { speedMatch } from '../../engines/speed';
import { challengeFingerprint, generateVariedChallenge } from '../../engines/variety';
import { clampLevel } from '../../config/curriculum';
import { TapGlyph } from '../svg/TapIcon';
import { sfxCoin, sfxSoft } from '../../audio/sfx';
import './speed-track.css';

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
        className="ml-speed-finish"
      >
        <div className="ml-speed-finish__card">
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
      className="ml-speed-race"
      style={{ '--ml-speed-accent': color } as CSSProperties}
    >
      <div className="ml-speed-race__scorebar">
        <div aria-label={`${score} הצלחות`} style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 19 }}>
          הצלחות: <span className="ml-number-text" style={{ color }}>{score}</span>
        </div>
        <div
          aria-label={`${left} שניות נותרו`}
          className={`ml-speed-race__timer${left <= 10 ? ' is-urgent' : ''}`}
        >
          {left}
        </div>
      </div>

      <p className="ml-speed-race__prompt">בחר את הצורה הזהה במהירות</p>
      <div
        data-speed-target={challenge.stimulus.target}
        className="ml-speed-race__target"
      >
        <span className="ml-speed-race__glyph ml-speed-race__glyph--target" aria-hidden>
          <TapGlyph id={challenge.stimulus.target} size={82} />
        </span>
      </div>

      <div className="ml-speed-race__options">
        {challenge.stimulus.options.map((id, index) => {
          const selected = flash?.index === index;
          return (
            <button
              key={`${round}-${id}`}
              type="button"
              data-speed-option={id}
              onClick={() => pick(index)}
              aria-label={`אפשרות ${index + 1}`}
              className={`ml-speed-race__option${selected ? flash.correct ? ' is-correct' : ' is-wrong' : ''}`}
            >
              <span className="ml-speed-race__glyph" aria-hidden><TapGlyph id={id} size={54} /></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
