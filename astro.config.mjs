// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import preact from '@astrojs/preact';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://kasbah3000.com', // Update with actual domain
  output: 'server', // SSR hybrid mode

  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'], // ar, es, zgh added in Phase 7
    routing: {
      prefixDefaultLocale: false,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    preact(),
    sitemap({
      filter: (page) => !page.includes('/dev/'),
      i18n: {
        defaultLocale: 'fr',
        locales: {
          fr: 'fr-FR',
          en: 'en-US',
        },
      },
    }),
  ],

  adapter: cloudflare(),
});
