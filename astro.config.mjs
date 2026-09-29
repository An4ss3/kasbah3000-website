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
    locales: ['fr', 'en', 'ar', 'de'],
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
      /*
        `/dev/` is the component preview route and `/inscription-confirmee` is the double opt-in
        landing page: both are `noindex`, so listing them in the sitemap would send search engines
        contradictory signals.
      */
      filter: (page) => !page.includes('/dev/') && !page.includes('/inscription-confirmee'),
      i18n: {
        defaultLocale: 'fr',
        locales: {
          fr: 'fr-FR',
          en: 'en-US',
          ar: 'ar-MA',
          de: 'de-DE',
        },
      },
    }),
  ],

  adapter: cloudflare(),
});
