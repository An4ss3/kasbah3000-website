/**
 * SEO Configuration
 * Default meta tags and Open Graph settings
 */

import { SITE, SOCIAL_LINKS } from './site';

export const SEO_DEFAULTS = {
  title: SITE.title,
  description: SITE.description,
  canonicalURL: SITE.url,

  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE.url,
    siteName: SITE.name,
    images: {
      url: '/og-image.jpg', // 1200x630
      width: 1200,
      height: 630,
      alt: SITE.title,
    },
  },

  twitter: {
    card: 'summary_large_image',
    site: '@kasbah3000', // Update when available
    creator: '@kasbah3000',
  },
} as const;

export const STRUCTURED_DATA = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/brand/logo.png`,
    sameAs: [SOCIAL_LINKS.linkedin, SOCIAL_LINKS.youtube, SOCIAL_LINKS.instagram],
  },

  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
  },
} as const;

// Principles (12 sustainability pillars)
export const PRINCIPLES_SLUGS = [
  'energy',
  'water',
  'food',
  'architecture',
  'mobility',
  'governance',
  'materials',
  'waste',
  'biodiversity',
  'community',
  'education',
  'health',
] as const;

export type PrincipleSlug = (typeof PRINCIPLES_SLUGS)[number];
