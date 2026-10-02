import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { DailyJourneyBanner } from './DailyJourneyBanner';
import { PlayerHUD } from './PlayerHUD';

describe('map entry points', () => {
  it('keeps the parent area out of the visible child navigation', () => {
    const html = renderToStaticMarkup(createElement(PlayerHUD, {
      profile: null,
      coins: 66,
      rank: 'beginner',
      onSwitchProfile: vi.fn(),
      onOpenAchievements: vi.fn(),
      onOpenCollections: vi.fn(),
      onOpenParent: vi.fn(),
    }));

    expect(html).not.toContain('הורים');
    expect(html).toContain('aria-label="MemoLand"');
    expect(html).toContain('הישגים');
    expect(html).toContain('אוספים');
  });

  it('renders the daily journey as one complete map call to action', () => {
    const html = renderToStaticMarkup(createElement(DailyJourneyBanner, {
      todayPoints: 66,
      dailyGoal: 1000,
      status: 'not-started',
      currentActivity: 0,
      onStart: vi.fn(),
    }));

    expect(html).toContain('מפת ההרפתקה');
    expect(html).toContain('המסע של היום');
    expect(html).toContain('memo-journey-map-wizard-v6.png');
    expect(html).not.toContain('בחרו עולם למשחק חופשי');
    expect(html).toContain('66/1000');
    expect(html).toContain('מתחילים מסע יומי');
  });
});
