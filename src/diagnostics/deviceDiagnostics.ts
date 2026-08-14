import { getSfxDiagnostics } from '../audio/sfx';
import { getSpeechDiagnostics, listHebrewVoices } from '../audio/speech';

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

export function detectBrowser(userAgent: string): string {
  const candidates: { name: string; expression: RegExp }[] = [
    { name: 'Samsung Internet', expression: /SamsungBrowser\/([\d.]+)/ },
    { name: 'Chrome iOS', expression: /CriOS\/([\d.]+)/ },
    { name: 'Chrome', expression: /Chrome\/([\d.]+)/ },
    { name: 'Safari', expression: /Version\/([\d.]+).*Safari/ },
  ];
  for (const candidate of candidates) {
    const version = userAgent.match(candidate.expression)?.[1];
    if (version) return `${candidate.name} ${version}`;
  }
  return 'Unknown';
}

function measureSafeArea() {
  const probe = document.createElement('div');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = [
    'position:fixed',
    'visibility:hidden',
    'pointer-events:none',
    'padding-top:env(safe-area-inset-top, 0px)',
    'padding-right:env(safe-area-inset-right, 0px)',
    'padding-bottom:env(safe-area-inset-bottom, 0px)',
    'padding-left:env(safe-area-inset-left, 0px)',
  ].join(';');
  document.body.appendChild(probe);
  const styles = getComputedStyle(probe);
  const safeArea = {
    top: styles.paddingTop,
    right: styles.paddingRight,
    bottom: styles.paddingBottom,
    left: styles.paddingLeft,
  };
  probe.remove();
  return safeArea;
}

async function serviceWorkerDiagnostics() {
  if (!('serviceWorker' in navigator)) return { supported: false };
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return {
      supported: true,
      controlled: Boolean(navigator.serviceWorker.controller),
      controller: navigator.serviceWorker.controller?.scriptURL ?? null,
      scope: registration?.scope ?? null,
      active: registration?.active?.state ?? null,
      waiting: registration?.waiting?.state ?? null,
      installing: registration?.installing?.state ?? null,
    };
  } catch (error) {
    return {
      supported: true,
      error: error instanceof Error ? error.message : 'unknown',
    };
  }
}

export async function collectDeviceDiagnostics() {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  const voices = synth?.getVoices() ?? [];
  const nav = navigator as NavigatorWithStandalone;
  const displayMode = window.matchMedia('(display-mode: standalone)').matches
    ? 'standalone'
    : window.matchMedia('(display-mode: fullscreen)').matches
      ? 'fullscreen'
      : window.matchMedia('(display-mode: minimal-ui)').matches
        ? 'minimal-ui'
        : 'browser';

  return {
    reportVersion: 1,
    capturedAt: new Date().toISOString(),
    build: {
      id: __MEMOLAND_BUILD_ID__,
      builtAt: __MEMOLAND_BUILD_TIME__,
      url: location.href,
    },
    browser: {
      detected: detectBrowser(navigator.userAgent),
      userAgent: navigator.userAgent,
      vendor: navigator.vendor,
      language: navigator.language,
      online: navigator.onLine,
      visibility: document.visibilityState,
    },
    viewport: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      clientWidth: document.documentElement.clientWidth,
      clientHeight: document.documentElement.clientHeight,
      visualWidth: window.visualViewport?.width ?? null,
      visualHeight: window.visualViewport?.height ?? null,
      visualOffsetTop: window.visualViewport?.offsetTop ?? null,
      visualOffsetLeft: window.visualViewport?.offsetLeft ?? null,
      devicePixelRatio: window.devicePixelRatio,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      availableScreenWidth: window.screen.availWidth,
      availableScreenHeight: window.screen.availHeight,
      orientation: window.screen.orientation?.type ?? null,
      safeArea: measureSafeArea(),
    },
    pwa: {
      displayMode,
      navigatorStandalone: nav.standalone ?? null,
      serviceWorker: await serviceWorkerDiagnostics(),
    },
    speech: {
      ...getSpeechDiagnostics(),
      voiceCount: voices.length,
      hebrewVoiceCount: listHebrewVoices().length,
      voices: voices.map((voice) => ({
        name: voice.name,
        lang: voice.lang,
        local: voice.localService,
        default: voice.default,
      })),
    },
    webAudio: getSfxDiagnostics(),
  };
}
