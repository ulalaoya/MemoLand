export function orderedCityProjectIndices(
  projectIds: readonly string[],
  cosmetics: ReadonlyArray<{ id: string }>,
): number[] {
  const acquiredAt = new Map(cosmetics.map((item, index) => [item.id, index]));
  return Array.from({ length: projectIds.length }, (_, index) => index).sort((a, b) => {
    const acquiredA = acquiredAt.get(projectIds[a]);
    const acquiredB = acquiredAt.get(projectIds[b]);
    if (acquiredA !== undefined && acquiredB !== undefined) return acquiredB - acquiredA;
    if (acquiredA !== undefined) return -1;
    if (acquiredB !== undefined) return 1;
    return a - b;
  });
}
