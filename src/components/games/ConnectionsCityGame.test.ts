import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { connectionsDirect } from '../../engines/connections';
import { MULTIPLICATION_FACT_BY_ID, preferredConnection } from '../../learning/multiplicationFacts';

let cityModule: typeof import('./ConnectionsCityGame');

beforeAll(async () => {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
  cityModule = await import('./ConnectionsCityGame');
});

describe('City child interaction', () => {
  it('renders every normal challenge as a direct numeric retrieval with no visible help', () => {
    const challenge = connectionsDirect.generate(1, 17, { now: 0 });
    const html = renderToStaticMarkup(createElement(cityModule.ConnectionsCityGame, {
      challenge,
      color: '#138f91',
      speechRate: 0.9,
      hintMode: false,
      onResult: () => undefined,
    }));

    expect(challenge.exerciseId).toBe('connections.direct');
    expect(html).toContain('כמה זה?');
    expect(html).toContain(cityModule.CITY_HINT_ENTRY_COPY);
    expect(html).toContain('>בדיקה<');
    expect(html).not.toContain('ml-city-game__hint-panel');
    expect(html).not.toContain(`= ${challenge.answer}`);
    for (let digit = 0; digit <= 9; digit++) {
      expect(html).toContain(`aria-label="ספרה ${digit}"`);
    }
  });

  it('begins at help level zero and wrong answers never open help automatically', () => {
    expect(cityModule.cityHelpLevelAfterWrong(0)).toBe(0);
    expect(cityModule.cityHelpLevelAfterWrong(2)).toBe(2);
    expect(cityModule.CITY_RETRY_COPY).toBe('כמעט, נסה שוב');
  });

  it('opens help only through explicit requests and keeps the first hint answer-free', () => {
    expect(cityModule.nextCityHelpLevel(0)).toBe(1);
    expect(cityModule.nextCityHelpLevel(1)).toBe(2);
    expect(cityModule.nextCityHelpLevel(3)).toBe(4);
    expect(cityModule.nextCityHelpLevel(4)).toBe(4);

    const target = MULTIPLICATION_FACT_BY_ID.get('7x8')!;
    const hint = preferredConnection(target);
    expect(cityModule.connectionAnchorText(hint)).toBe('7 × 7 = 49');
    expect(cityModule.connectionAnchorText(hint)).not.toContain(String(target.answer));
    expect(cityModule.connectionBridgeText(hint)).toBe('49 + 7 = ?');
    expect(cityModule.connectionBridgeText(hint)).not.toContain(String(target.answer));
  });

  it('adds a visible City growth step on a correct answer without removing prior growth', () => {
    expect(cityModule.visibleCityTier(2, 'answering')).toBe(2);
    expect(cityModule.visibleCityTier(2, 'success')).toBe(3);
    expect(cityModule.visibleCityTier(6, 'success')).toBe(6);
  });
});
