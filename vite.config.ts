/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const buildId = process.env.COMMIT_REF?.slice(0, 12) ?? `local-${new Date().toISOString()}`;
const buildTime = new Date().toISOString();

// base: './' keeps asset paths relative so the built app runs from any static
// host (Netlify drop, Vercel, GitHub Pages, or a local file server).
export default defineConfig({
  base: './',
  define: {
    __MEMOLAND_BUILD_ID__: JSON.stringify(buildId),
    __MEMOLAND_BUILD_TIME__: JSON.stringify(buildTime),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg', 'app-icon.png', 'app-icon-maskable.png'],
      manifest: {
        name: 'MemoLand — עולם של זיכרון',
        short_name: 'MemoLand',
        description: 'אימון זיכרון יומי לילדים',
        lang: 'he',
        dir: 'rtl',
        theme_color: '#2D8CFF',
        background_color: '#67C8FF',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        icons: [
          { src: 'app-icon.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'app-icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'app-icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,wav,woff2}'],
        // גרסה חדשה משתלטת מיד — בלי להיתקע על מטמון ישן
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
