import { createElement, createRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  CoinRewardExperience,
  coinRewardAnimationPlan,
  countUpCoinTotal,
  createCoinRewardEvent,
  representativeCoinCount,
} from './CoinRewardExperience';

describe('shared coin reward experience', () => {
  it('creates a reward only when the persisted total increases', () => {
    expect(createCoinRewardEvent(1, 20, 20)).toBeNull();
    expect(createCoinRewardEvent(2, 20, 19)).toBeNull();
    expect(createCoinRewardEvent(3, 20, 28)).toEqual({ id: 3, from: 20, to: 28 });
  });

  it('uses four to six representative coins rather than one icon per awarded coin', () => {
    expect(representativeCoinCount(0)).toBe(0);
    expect(representativeCoinCount(1)).toBe(4);
    expect(representativeCoinCount(8)).toBe(4);
    expect(representativeCoinCount(10)).toBe(5);
    expect(representativeCoinCount(100)).toBe(6);
  });

  it('counts from the previous total to the exact persisted total', () => {
    expect(countUpCoinTotal(120, 128, 0)).toBe(120);
    expect(countUpCoinTotal(120, 128, 0.5)).toBe(124);
    expect(countUpCoinTotal(120, 128, 1)).toBe(128);
    expect(countUpCoinTotal(120, 128, 4)).toBe(128);
  });

  it('removes flying coins for reduced motion while retaining the count update', () => {
    expect(coinRewardAnimationPlan(8, false)).toEqual({
      representativeCoins: 4,
      countDurationMs: 720,
      totalDurationMs: 880,
    });
    expect(coinRewardAnimationPlan(8, true)).toEqual({
      representativeCoins: 0,
      countDurationMs: 220,
      totalDurationMs: 260,
    });
  });

  it('renders the exact HUD total with no flight when there is no reward', () => {
    const html = renderToStaticMarkup(createElement(CoinRewardExperience, {
      total: 128,
      reward: null,
      sourceRef: createRef<HTMLElement>(),
    }));

    expect(html).toContain('aria-label="מטבעות: 128"');
    expect(html).toContain('data-displayed-coins="128"');
    expect(html).toContain('data-persisted-coins="128"');
    expect(html).not.toContain('data-coin-reward');
  });

  it('renders a compact representative flight for an active reward', () => {
    const html = renderToStaticMarkup(createElement(CoinRewardExperience, {
      total: 128,
      reward: { id: 7, from: 120, to: 128 },
      sourceRef: createRef<HTMLElement>(),
    }));

    expect(html).toContain('data-coin-reward="8"');
    expect(html).toContain('data-representative-coins="4"');
    expect(html.match(/ml-coin-reward__flying-coin/g)).toHaveLength(4);
    expect(html).toContain('data-displayed-coins="120"');
  });
});
