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
    expect(html).not.toContain('עוד רמז');
    expect(html.indexOf('ml-city-game__help-zone')).toBeGreaterThan(html.indexOf('ml-city-game__actions'));
    for (let digit = 0; digit <= 9; digit++) {
      expect(html).toContain(`aria-label="ספרה ${digit}"`);
    }
  });

  it('begins at help level zero and wrong answers never open help automatically', () => {
    expect(cityModule.cityHelpLevelAfterWrong(0)).toBe(0);
    expect(cityModule.cityHelpLevelAfterWrong(2)).toBe(2);
    expect(cityModule.CITY_RETRY_COPY).toBe('כמעט, נסה שוב');
  });

  it('opens exactly one three-step answer-free explanation', () => {
    expect(cityModule.nextCityHelpLevel(0)).toBe(1);
    expect(cityModule.nextCityHelpLevel(1)).toBe(1);
    expect(cityModule.nextCityHelpLevel(4)).toBe(1);

    const cases = [
      ['2x4', '2 × 3 = 6', '2 × 4 = 2 × 3 + 2', '6 + 2 = ?'],
      ['6x8', '5 × 8 = 40', '6 × 8 = 5 × 8 + 8', '40 + 8 = ?'],
      ['7x8', '7 × 7 = 49', '7 × 8 = 7 × 7 + 7', '49 + 7 = ?'],
      ['6x9', '10 × 6 = 60', '9 × 6 = 10 × 6 - 6', '60 - 6 = ?'],
    ] as const;
    for (const [factId, knownFact, targetRelationship, arithmeticQuestion] of cases) {
      const target = MULTIPLICATION_FACT_BY_ID.get(factId)!;
      const explanation = cityModule.buildCityHintExplanation(target, preferredConnection(target));
      expect(explanation).toEqual({ knownFact, targetRelationship, arithmeticQuestion });
      expect(`${explanation.targetRelationship} ${explanation.arithmeticQuestion}`)
        .not.toContain(`${target.a} × ${target.b} = ${target.answer}`);
    }
  });

  it('allows one direct retry, then reveals; a supported miss reveals immediately', () => {
    expect(cityModule.outcomeAfterWrong(0, 0)).toBe('retry-same-question');
    expect(cityModule.outcomeAfterWrong(0, 1)).toBe('reveal-and-new-question');
    expect(cityModule.outcomeAfterWrong(1, 0)).toBe('reveal-and-new-question');
    expect(cityModule.CITY_CORRECT_REVEAL_MS).toBeGreaterThanOrEqual(1_200);
    expect(cityModule.CITY_CORRECT_REVEAL_MS).toBeLessThanOrEqual(1_800);
  });

  it('starts as an empty construction site with no completed or faded buildings', () => {
    const challenge = connectionsDirect.generate(1, 17, { now: 0 });
    const html = renderToStaticMarkup(createElement(cityModule.ConnectionsCityGame, {
      challenge,
      color: '#138f91',
      speechRate: 0.9,
      hintMode: false,
      onResult: () => undefined,
    }));

    expect(html).toContain('data-city-milestones="0"');
    expect(html.match(/class="ml-city-game__foundation"/g)).toHaveLength(20);
    expect(html).not.toContain('class="ml-city-game__building"');
    expect(html).toContain('data-city-district="0"');
    expect(html).toContain('data-city-district-built="0"');
  });

  it('builds two rows of ten and rolls into an unbounded next district', () => {
    expect(cityModule.CITY_DISTRICT_CAPACITY).toBe(20);
    expect(cityModule.CITY_BUILDING_CONSTRUCTION).toBe('rise');
    const cases = [
      { total: 0, district: 0, back: 0, front: 0, complete: false },
      { total: 1, district: 0, back: 1, front: 0, complete: false },
      { total: 10, district: 0, back: 10, front: 0, complete: false },
      { total: 11, district: 0, back: 10, front: 1, complete: false },
      { total: 20, district: 0, back: 10, front: 10, complete: true },
      { total: 21, district: 1, back: 1, front: 0, complete: false },
      { total: 40, district: 1, back: 10, front: 10, complete: true },
      { total: 41, district: 2, back: 1, front: 0, complete: false },
    ] as const;

    for (const expected of cases) {
      const model = cityModule.cityDistrictModel(expected.total);
      expect(model.districtIndex).toBe(expected.district);
      expect(model.backRow.filter(Boolean)).toHaveLength(expected.back);
      expect(model.frontRow.filter(Boolean)).toHaveLength(expected.front);
      expect(model.districtComplete).toBe(expected.complete);
    }
  });

  it('uses the explicit completion moment without replacing normal success feedback', () => {
    expect(cityModule.CITY_SUCCESS_COPY).toBe('מעולה! העיר גדלה');
    expect(cityModule.CITY_DISTRICT_COMPLETE_COPY).toBe('הרובע הושלם!');
  });
});
