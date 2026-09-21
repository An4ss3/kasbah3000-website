/**
 * Site Configuration
 * Single source of truth for site-wide constants
 */

export const SITE = {
  name: 'Kasbah3000',
  title: 'Kasbah3000 — A way of living for a better future',
  description:
    'Multigenerational ecological settlement combining ancestral Moroccan architecture with third-millennium sustainable engineering.',
  url: import.meta.env.PUBLIC_SITE_URL || 'https://kasbah3000.com',
  defaultLanguage: 'fr' as const,
  languages: ['fr', 'en', 'ar', 'de'] as const,
} as const;

/** Locales that render right-to-left. */
export const RTL_LANGUAGES = ['ar'] as const;

/**
 * Fallback chain used when a locale has no value for a key or content entry.
 * Arabic and German fall back to English, English to French.
 */
export const LANGUAGE_FALLBACKS = {
  fr: [],
  en: ['fr'],
  ar: ['en', 'fr'],
  de: ['en', 'fr'],
} as const;

/** BCP 47 / Open Graph locale codes per language. */
export const LOCALE_CODES = {
  fr: 'fr_FR',
  en: 'en_US',
  ar: 'ar_MA',
  de: 'de_DE',
} as const;

export const ORGANIZATION = {
  name: 'Garden-Generator',
  legalName: 'Garden-Generator SARL',
  foundedYear: 2026,
  email: 'contact@kasbah3000.com',
  phone: '+212 XXX XXX XXX', // Update with real number
} as const;

export const SOCIAL_LINKS = {
  linkedin: 'https://www.linkedin.com/in/wagdiothmane',
  youtube: 'https://youtube.com/@kasbah3000', // Update with the real channel
  instagram: 'https://www.instagram.com/kasbah_3000',
  // Additional social links as needed
} as const;

/**
 * About page presentation film.
 *
 * The design handoff schedules the 60–90s brand film as a later asset, and no published
 * Kasbah3000 video exists in the project materials yet, so `youtubeId` is intentionally empty.
 * Set it to the bare YouTube id (for example `dQw4w9WgXcQ`) and the About page swaps its
 * still-image panel for a real privacy-mode embed — no other change is required.
 */
export const ABOUT_VIDEO = {
  youtubeId: '',
  /** Shown while no film is published, and as the embed's poster once one is. */
  posterSrc: '/media/site/oasis-village-sunset.jpg',
} as const;

export const CONTACT = {
  email: 'contact@kasbah3000.com',
  whatsapp: '+212XXXXXXXXX', // Update with real number
  address: {
    street: '', // Update when available
    city: 'Agadir', // Primary location per Strategic Alignment
    region: 'Souss-Massa',
    country: 'Morocco',
  },
} as const;
