import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { registerMemoLandPwa } from './pwa';

// גופנים מ-self-host (עברית + לטינית) — נטענים תמיד, גם אופליין ב-PWA.
import '@fontsource/rubik/hebrew-400.css';
import '@fontsource/rubik/hebrew-500.css';
import '@fontsource/rubik/hebrew-600.css';
import '@fontsource/rubik/hebrew-700.css';
import '@fontsource/rubik/latin-400.css';
import '@fontsource/rubik/latin-500.css';
import '@fontsource/rubik/latin-600.css';
import '@fontsource/rubik/latin-700.css';
import '@fontsource/assistant/hebrew-400.css';
import '@fontsource/assistant/hebrew-600.css';
import '@fontsource/assistant/hebrew-700.css';
import '@fontsource/assistant/latin-400.css';
import '@fontsource/assistant/latin-600.css';
import '@fontsource/assistant/latin-700.css';
import '@fontsource/lilita-one/latin-400.css';

import './design/tokens.css';
import './design/typography.css';
import './design/motion.css';
import './index.css';

function syncAppViewportHeight() {
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  document.documentElement.style.setProperty('--ml-app-height', `${Math.round(viewportHeight)}px`);
}

document.documentElement.dataset.memolandBuild = __MEMOLAND_BUILD_ID__;
document.documentElement.dataset.memolandBuildTime = __MEMOLAND_BUILD_TIME__;
syncAppViewportHeight();
window.addEventListener('resize', syncAppViewportHeight);
window.visualViewport?.addEventListener('resize', syncAppViewportHeight);
registerMemoLandPwa();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
