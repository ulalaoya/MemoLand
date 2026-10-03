import { describe, expect, it } from 'vitest';
import { orderedCityProjectIndices } from './collectionOrder';

describe('collections puzzle order', () => {
  it('shows the most recently completed puzzle first', () => {
    const projectIds = Array.from({ length: 30 }, (_, index) => `city.project.${index}`);
    const cosmetics = [
      { id: projectIds[4] },
      { id: 'hat.star' },
      { id: projectIds[29] },
    ];

    expect(orderedCityProjectIndices(projectIds, cosmetics).slice(0, 3)).toEqual([29, 4, 0]);
  });
});
