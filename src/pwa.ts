const RELOAD_GUARD_KEY = 'memoland.pwa.reload-build';
const UPDATE_INTERVAL_MS = 2 * 60 * 1000;

function guardedReloadOnControllerChange() {
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    let lastReloadedBuild: string | null = null;
    try {
      lastReloadedBuild = sessionStorage.getItem(RELOAD_GUARD_KEY);
    } catch {
      // sessionStorage can be unavailable in strict privacy modes.
    }
    if (lastReloadedBuild === __MEMOLAND_BUILD_ID__) return;
    reloading = true;
    try {
      sessionStorage.setItem(RELOAD_GUARD_KEY, __MEMOLAND_BUILD_ID__);
    } catch {
      // The in-memory guard still prevents repeated reloads in this page.
    }
    window.location.reload();
  });
}

/** Registers the generated Workbox worker without touching profile localStorage. */
export function registerMemoLandPwa(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  guardedReloadOnControllerChange();
  const install = () => {
    const swUrl = new URL('sw.js', document.baseURI);
    navigator.serviceWorker.register(swUrl, { updateViaCache: 'none' }).then((registration) => {
      const checkForUpdate = () => registration.update().catch(() => undefined);
      window.setInterval(checkForUpdate, UPDATE_INTERVAL_MS);
      window.addEventListener('pageshow', checkForUpdate);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdate();
      });
      checkForUpdate();
    }).catch(() => {
      // Offline first launch: the previously installed worker remains usable.
    });
  };
  if (document.readyState === 'complete') install();
  else window.addEventListener('load', install, { once: true });
}
