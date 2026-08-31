import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  SPEED_RACE_FINISH_TITLE,
  SPEED_RACE_SECONDS,
  SpeedMatchGame,
  speedRaceSummary,
} from './SpeedMatchGame';

describe('Speed Track race shell', () => {
  it('starts at 60 with a visible success counter and no feedback banner copy', () => {
    const html = renderToStaticMarkup(createElement(SpeedMatchGame, {
      seconds: 60,
      color: '#f97316',
      baseLevel: 1,
      seed: 22,
      onDone: () => undefined,
    }));
    expect(html).toContain('data-speed-race');
    expect(html).toContain('60 שניות נותרו');
    expect(html).toContain('הצלחות:');
    expect(html).not.toMatch(/טוב מאוד|יופי|נסה שוב|FeedbackBanner/);
  });

  it('uses the required 60-second duration and exact finish copy', () => {
    expect(SPEED_RACE_SECONDS).toBe(60);
    expect(SPEED_RACE_FINISH_TITLE).toBe('סיימת את המרוץ!');
    expect(speedRaceSummary(17)).toBe('17 הצלחות בדקה');
  });
});
