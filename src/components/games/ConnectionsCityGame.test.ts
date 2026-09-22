import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { connectionsDirect } from '../../engines/connections';
import { MULTIPLICATION_FACT_BY_ID, preferredConnection } from '../../learning/multiplicationFacts';

let cityModule: typeof import('./ConnectionsCityGame');
let storeModule: typeof import('../../state/store');

beforeAll(async () => {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
  cityModule = await import('./ConnectionsCityGame');
  storeModule = await import('../../state/store');
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
    expect(html).toContain('aria-label="מקלדת מחשבון"');
    expect(html).toContain('aria-label="מחיקת ספרה אחרונה"');
    expect(html).not.toContain('ml-city-game__actions');
    expect(html.indexOf('ml-city-game__help-zone')).toBeGreaterThan(html.indexOf('ml-city-game__calculator'));
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

  it('starts with an empty fifteen-piece puzzle and no faded completed picture', () => {
    const challenge = connectionsDirect.generate(1, 17, { now: 0 });
    const html = renderToStaticMarkup(createElement(cityModule.ConnectionsCityGame, {
      challenge,
      color: '#138f91',
      speechRate: 0.9,
      hintMode: false,
      onResult: () => undefined,
    }));

    expect(html).toContain('data-city-milestones="0"');
    expect(html.match(/ml-city-game__puzzle-piece/g)).toHaveLength(15);
    expect(html.match(/ml-city-game__puzzle-art/g)).toHaveLength(15);
    expect(html).toContain('aria-label="בונים עיר, 0 מתוך 15 חלקים"');
    expect(html).not.toContain('ml-city-game__piece is-built');
    expect(html).not.toContain('class="ml-city-game__foundation"');
    expect(html).not.toContain('class="ml-city-game__building"');
    expect(html).toContain('data-city-district="0"');
    expect(html).toContain('data-city-district-built="0"');
  });

  it('builds fifteen parts and rolls into an unbounded next project', () => {
    expect(cityModule.CITY_DISTRICT_CAPACITY).toBe(15);
    expect(cityModule.CITY_PUZZLE_COLUMNS).toBe(5);
    expect(cityModule.CITY_PUZZLE_ROWS).toBe(3);
    const puzzlePaths = Array.from(
      { length: cityModule.CITY_DISTRICT_CAPACITY },
      (_, index) => cityModule.cityPuzzlePiecePath(index),
    );
    expect(new Set(puzzlePaths)).toHaveLength(15);
    expect(puzzlePaths.every((path) => path.endsWith(' Z'))).toBe(true);
    expect(puzzlePaths.filter((path) => path.includes(' C '))).toHaveLength(15);
    const cases = [
      { total: 0, district: 0, back: 0, front: 0, complete: false },
      { total: 1, district: 0, back: 1, front: 0, complete: false },
      { total: 8, district: 0, back: 8, front: 0, complete: false },
      { total: 9, district: 0, back: 8, front: 1, complete: false },
      { total: 15, district: 0, back: 8, front: 7, complete: true },
      { total: 16, district: 1, back: 1, front: 0, complete: false },
      { total: 30, district: 1, back: 8, front: 7, complete: true },
      { total: 31, district: 2, back: 1, front: 0, complete: false },
    ] as const;

    for (const expected of cases) {
      const model = cityModule.cityDistrictModel(expected.total);
      expect(model.districtIndex).toBe(expected.district);
      expect(model.backRow.filter(Boolean)).toHaveLength(expected.back);
      expect(model.frontRow.filter(Boolean)).toHaveLength(expected.front);
      expect(model.districtComplete).toBe(expected.complete);
    }
  });

  it('celebrates the second row and gives every 15-part project a longer explicit finish', () => {
    expect(cityModule.cityProjectCelebration(7)).toBeNull();
    expect(cityModule.cityProjectCelebration(8)).toBe('מצוין, העיר גדלה!');
    expect(cityModule.cityProjectCelebration(15)).toBe('כל הכבוד! סיימת לבנות את העיר!');
    expect(cityModule.cityProjectCelebration(23)).toBe('מצוין, פסל הלגו מתקדם!');
    expect(cityModule.cityProjectCelebration(30)).toBe('כל הכבוד! סיימת לבנות את פסל הלגו!');
    expect(cityModule.cityProjectCelebration(38)).toBe('מצוין, מכונית המרוץ מתקדמת!');
    expect(cityModule.cityProjectCelebration(45)).toBe('כל הכבוד! מכונית המרוץ מוכנה!');
    expect(cityModule.citySuccessDelay(14)).toBe(920);
    expect(cityModule.citySuccessDelay(15)).toBe(cityModule.CITY_PROJECT_COMPLETE_MS);
    expect(cityModule.CITY_PROJECT_COMPLETE_MS).toBeGreaterThanOrEqual(2_500);
  });

  it('cycles through thirty distinct construction projects', () => {
    const projects = Array.from(
      { length: cityModule.CITY_BUILD_PROJECT_COUNT },
      (_, index) => cityModule.cityBuildProject(index),
    );
    expect(cityModule.CITY_BUILD_PROJECT_COUNT).toBe(30);
    expect(new Set(projects.map((project) => project.kind))).toHaveLength(30);
    expect(new Set(projects.map((project) => project.title))).toHaveLength(30);
    expect(cityModule.cityBuildProject(30).kind).toBe('city');

    const challenge = connectionsDirect.generate(1, 17, { now: 0 });
    const renderAt = (cityGrowthMilestones: number) => {
      storeModule.replaceState({ ...storeModule.getState(), cityGrowthMilestones });
      return renderToStaticMarkup(createElement(cityModule.ConnectionsCityGame, {
        challenge,
        color: '#138f91',
        speechRate: 0.9,
        hintMode: false,
        onResult: () => undefined,
      }));
    };
    const blocks = renderAt(16);
    expect(blocks).toContain('data-city-project="blocks"');
    expect(blocks).toContain('בונים פסל לגו');
    expect(blocks).not.toContain('בונים פסל לגו ·');
    expect(blocks.match(/ml-city-game__piece/g)).toHaveLength(15);
    expect(blocks.match(/ml-city-game__piece is-built/g)).toHaveLength(1);
    expect(blocks.match(/ml-city-game__puzzle-icon/g)).toHaveLength(1);
    expect(blocks.match(/href="#ml-city-puzzle-art-blocks"/g)).toHaveLength(15);
    expect(blocks).not.toContain('ml-city-game__building');

    const raceCar = renderAt(31);
    expect(raceCar).toContain('data-city-project="race-car"');
    expect(raceCar).toContain('מרכיבים מכונית מרוץ');
    expect(raceCar.match(/ml-city-game__piece/g)).toHaveLength(15);

    for (let projectIndex = 3; projectIndex < cityModule.CITY_BUILD_PROJECT_COUNT; projectIndex++) {
      const project = cityModule.cityBuildProject(projectIndex);
      const projectHtml = renderAt(projectIndex * cityModule.CITY_DISTRICT_CAPACITY + 1);
      expect(projectHtml).toContain(`data-city-project="${project.kind}"`);
      expect(projectHtml).toContain(project.title);
      expect(projectHtml).not.toContain(`${project.title} ·`);
      expect(projectHtml.match(/ml-city-game__piece/g)).toHaveLength(15);
      expect(projectHtml.match(/ml-city-game__piece is-built/g)).toHaveLength(1);
      expect(projectHtml.match(/ml-city-game__puzzle-icon/g)).toHaveLength(1);
      expect(projectHtml.match(new RegExp(`href="#ml-city-puzzle-art-${project.kind}"`, 'g'))).toHaveLength(15);
      expect(projectHtml).not.toContain('ml-city-game__blueprint');
    }
  });

  it('keeps a completed project during congratulations, then opens the next one empty', () => {
    const completedCity = cityModule.cityProjectDisplayModel(15, true);
    expect(completedCity.districtIndex).toBe(0);
    expect(completedCity.builtCount).toBe(15);
    expect(completedCity.districtComplete).toBe(true);

    const newBlocksProject = cityModule.cityProjectDisplayModel(15);
    expect(newBlocksProject.districtIndex).toBe(1);
    expect(newBlocksProject.builtCount).toBe(0);
    expect(newBlocksProject.districtComplete).toBe(false);
    expect(newBlocksProject.backRow.filter(Boolean)).toHaveLength(0);
    expect(newBlocksProject.frontRow.filter(Boolean)).toHaveLength(0);

    const sixteenthAnswer = cityModule.cityProjectDisplayModel(16);
    expect(sixteenthAnswer.districtIndex).toBe(1);
    expect(sixteenthAnswer.builtCount).toBe(1);
    expect(sixteenthAnswer.backRow.filter(Boolean)).toHaveLength(1);

    expect(cityModule.cityProjectDisplayModel(30).districtIndex).toBe(2);
    expect(cityModule.cityProjectDisplayModel(30).builtCount).toBe(0);
  });
});
