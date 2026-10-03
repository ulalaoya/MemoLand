/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const buildId = process.env.GITHUB_SHA?.slice(0, 12)
  ?? process.env.COMMIT_REF?.slice(0, 12)
  ?? `local-${new Date().toISOString()}`;
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
      injectRegister: false,
      includeAssets: [
        'brand/app-icon-logo-v1.png',
        'brand/app-icon-logo-maskable-v1.png',
      ],
      manifest: {
        name: 'MemoLand — עולם של זיכרון',
        short_name: 'MemoLand',
        description: 'אימון זיכרון יומי לילדים',
        lang: 'he',
        dir: 'rtl',
        theme_color: '#0B244D',
        background_color: '#071A3D',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        icons: [
          { src: 'brand/app-icon-logo-v1.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'brand/app-icon-logo-maskable-v1.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        cacheId: `memoland-${buildId}`,
        globPatterns: ['**/*.{js,css,html,svg,png,webp,wav,woff2}'],
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
