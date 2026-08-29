import { useEffect, useRef, useState, type RefObject } from 'react';
import { Coin } from './svg/Icons';
import './coin-reward-experience.css';

export interface CoinRewardEvent {
  id: number;
  from: number;
  to: number;
}

export function createCoinRewardEvent(id: number, from: number, to: number): CoinRewardEvent | null {
  if (to <= from) return null;
  return { id, from, to };
}

export function representativeCoinCount(amount: number): number {
  if (amount <= 0) return 0;
  return Math.min(6, Math.max(4, Math.ceil(amount / 2)));
}

export function countUpCoinTotal(from: number, to: number, progress: number): number {
  const safeProgress = Math.max(0, Math.min(1, progress));
  return Math.min(to, from + Math.floor((to - from) * safeProgress));
}

export function coinRewardAnimationPlan(amount: number, reducedMotion: boolean) {
  return {
    representativeCoins: reducedMotion ? 0 : representativeCoinCount(amount),
    countDurationMs: reducedMotion ? 220 : 720,
    totalDurationMs: reducedMotion ? 260 : 880,
  };
}

interface FlightCoordinates {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export function CoinRewardExperience({
  total,
  reward,
  sourceRef,
}: {
  total: number;
  reward: CoinRewardEvent | null;
  sourceRef: RefObject<HTMLElement>;
}) {
  const [displayedTotal, setDisplayedTotal] = useState(reward?.from ?? total);
  const [activeReward, setActiveReward] = useState<CoinRewardEvent | null>(reward);
  const [coordinates, setCoordinates] = useState<FlightCoordinates | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media) return undefined;
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (!reward) {
      setDisplayedTotal(total);
      setActiveReward(null);
      return undefined;
    }

    const amount = reward.to - reward.from;
    const plan = coinRewardAnimationPlan(amount, reducedMotion);
    const source = sourceRef.current?.getBoundingClientRect();
    const target = counterRef.current?.getBoundingClientRect();
    setCoordinates({
      startX: source ? source.left + source.width / 2 : window.innerWidth / 2,
      startY: source ? source.top + source.height * 0.58 : window.innerHeight * 0.58,
      endX: target ? target.left + target.width / 2 : window.innerWidth - 54,
      endY: target ? target.top + target.height / 2 : 54,
    });
    setActiveReward(reward);
    setDisplayedTotal(reward.from);

    const startedAt = performance.now();
    const updateCount = (now: number) => {
      const progress = (now - startedAt) / plan.countDurationMs;
      setDisplayedTotal(countUpCoinTotal(reward.from, reward.to, progress));
      if (progress < 1) animationFrame.current = window.requestAnimationFrame(updateCount);
      else setDisplayedTotal(reward.to);
    };
    animationFrame.current = window.requestAnimationFrame(updateCount);
    const finishTimer = window.setTimeout(() => {
      setDisplayedTotal(reward.to);
      setActiveReward(null);
    }, plan.totalDurationMs);

    return () => {
      window.clearTimeout(finishTimer);
      if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current);
    };
  }, [reducedMotion, reward, sourceRef, total]);

  const amount = activeReward ? activeReward.to - activeReward.from : 0;
  const representativeCoins = coinRewardAnimationPlan(amount, reducedMotion).representativeCoins;
  const flight = coordinates ?? { startX: 0, startY: 0, endX: 0, endY: 0 };

  return (
    <>
      <div
        ref={counterRef}
        className={`ml-session-coin-counter${activeReward ? ' is-receiving' : ''}`}
        aria-label={`מטבעות: ${displayedTotal}`}
        aria-live="polite"
        data-displayed-coins={displayedTotal}
        data-persisted-coins={total}
      >
        <Coin size={21} />
        <strong>{displayedTotal}</strong>
      </div>
      {activeReward && representativeCoins > 0 ? (
        <div
          className="ml-coin-reward"
          aria-hidden
          data-coin-reward={activeReward.to - activeReward.from}
          data-representative-coins={representativeCoins}
        >
          {Array.from({ length: representativeCoins }).map((_, index) => {
            const spread = [-42, -22, 22, 42, -12, 12][index] ?? 0;
            const lift = [-25, -43, -47, -27, -54, -36][index] ?? -32;
            return (
              <span
                key={`${activeReward.id}-${index}`}
                className="ml-coin-reward__flying-coin"
                style={{
                  '--coin-start-x': `${flight.startX}px`,
                  '--coin-start-y': `${flight.startY}px`,
                  '--coin-end-x': `${flight.endX}px`,
                  '--coin-end-y': `${flight.endY}px`,
                  '--coin-pop-x': `${spread}px`,
                  '--coin-pop-y': `${lift}px`,
                  '--coin-delay': `${index * 55}ms`,
                } as React.CSSProperties}
              >
                <Coin size={24} />
              </span>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
