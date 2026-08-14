import { describe, expect, it } from 'vitest';
import { detectBrowser } from './deviceDiagnostics';

describe('device diagnostics browser detection', () => {
  it('prefers the Samsung Internet token over its embedded Chrome token', () => {
    const userAgent = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 SamsungBrowser/24.0 Chrome/117.0.0.0 Mobile Safari/537.36';
    expect(detectBrowser(userAgent)).toBe('Samsung Internet 24.0');
  });

  it('detects Android Chrome', () => {
    const userAgent = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/126.0.0.0 Mobile Safari/537.36';
    expect(detectBrowser(userAgent)).toBe('Chrome 126.0.0.0');
  });

  it('returns Unknown when there is no recognized browser token', () => {
    expect(detectBrowser('MemoLand test agent')).toBe('Unknown');
  });
});
