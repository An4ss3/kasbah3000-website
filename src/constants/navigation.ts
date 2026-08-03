/**
 * Navigation Configuration
 * Primary and secondary navigation structure
 */

export interface NavItem {
  label: {
    fr: string;
    en: string;
  };
  href: string;
  external?: boolean;
}

export const PRIMARY_NAV: NavItem[] = [
  {
    label: { fr: 'Projet', en: 'Project' },
    href: '/project',
  },
  {
    label: { fr: 'Principes', en: 'Principles' },
    href: '/principles',
  },
  {
    label: { fr: 'À propos', en: 'About' },
    href: '/about',
  },
  {
    label: { fr: 'Galerie', en: 'Gallery' },
    href: '/gallery',
  },
  {
    label: { fr: 'Actualités', en: 'News' },
    href: '/blog',
  },
  {
    label: { fr: 'Contact', en: 'Contact' },
    href: '/contact',
  },
] as const;

export const FOOTER_NAV = {
  discover: [
    {
      label: { fr: 'Le projet', en: 'The Project' },
      href: '/project',
    },
    {
      label: { fr: 'Nos principes', en: 'Our Principles' },
      href: '/principles',
    },
    {
      label: { fr: 'Équipe', en: 'Team' },
      href: '/team',
    },
    {
      label: { fr: 'Partenaires', en: 'Partners' },
      href: '/partners',
    },
  ],
  resources: [
    {
      label: { fr: 'Galerie', en: 'Gallery' },
      href: '/gallery',
    },
    {
      label: { fr: 'Actualités', en: 'News' },
      href: '/blog',
    },
    {
      label: { fr: 'FAQ', en: 'FAQ' },
      href: '/faq',
    },
  ],
  legal: [
    {
      label: { fr: 'Confidentialité', en: 'Privacy' },
      href: '/legal/privacy',
    },
    {
      label: { fr: "Conditions d'utilisation", en: 'Terms of Use' },
      href: '/legal/terms',
    },
    {
      label: { fr: 'Cookies', en: 'Cookies' },
      href: '/legal/cookies',
    },
  ],
} as const;
