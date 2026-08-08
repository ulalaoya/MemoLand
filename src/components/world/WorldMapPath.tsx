interface WorldMapPathProps {
  total: number;
  currentIndex: number;
}

export function WorldMapPath({ total, currentIndex }: WorldMapPathProps) {
  const path = buildRoute(total);
  const progress = total <= 1 ? 1 : Math.max(0, Math.min(1, currentIndex / (total - 1)));

  return (
    <svg className="ml-world-route" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden focusable="false">
      <defs>
        <linearGradient id="ml-route-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--ml-yellow)" />
          <stop offset={progress} stopColor="var(--ml-orange)" />
          <stop offset={Math.min(1, progress + 0.001)} stopColor="var(--ml-earth)" />
          <stop offset="1" stopColor="var(--ml-earth-deep)" />
        </linearGradient>
      </defs>
      <path className="ml-world-route__shadow" d={path} />
      <path className="ml-world-route__border" d={path} />
      <path className="ml-world-route__road" d={path} />
      <path className="ml-world-route__shine" d={path} />
    </svg>
  );
}

function buildRoute(total: number): string {
  if (total <= 0) return '';
  const points = Array.from({ length: total }, (_, index) => ({
    x: index % 2 === 0 ? 84 : 16,
    y: ((index + 0.5) / total) * 1000,
  }));

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const point = points[index];
    const midpoint = (previous.y + point.y) / 2;
    path += ` C ${previous.x} ${midpoint}, ${point.x} ${midpoint}, ${point.x} ${point.y}`;
  }
  return path;
}
