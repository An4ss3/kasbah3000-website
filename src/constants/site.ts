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
  languages: ['fr', 'en'] as const, // ar, es, zgh routable in Phase 7
} as const;

export const ORGANIZATION = {
  name: 'Garden-Generator',
  legalName: 'Garden-Generator SARL',
  foundedYear: 2026,
  email: 'contact@kasbah3000.com',
  phone: '+212 XXX XXX XXX', // Update with real number
} as const;

export const SOCIAL_LINKS = {
  linkedin: 'https://linkedin.com/company/kasbah3000',
  youtube: 'https://youtube.com/@kasbah3000',
  instagram: 'https://instagram.com/kasbah3000',
  // Additional social links as needed
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
