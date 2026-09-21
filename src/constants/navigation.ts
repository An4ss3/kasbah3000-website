/**
 * Navigation Configuration
 * Primary and secondary navigation structure
 */

import type { LocalizedString } from '@types';

export interface NavItem {
  label: LocalizedString;
  href: string;
  external?: boolean;
}

/**
 * Primary navigation.
 *
 * `Home` is listed first so the site has an explicit route back to the localized home page
 * in addition to the header logo, which stays clickable. `Header.astro` splits this list in
 * half around the centred logo, so order changes affect both nav groups.
 */
export const PRIMARY_NAV: NavItem[] = [
  {
    label: { fr: 'Accueil', en: 'Home', ar: 'الرئيسية', de: 'Startseite' },
    href: '/',
  },
  {
    label: { fr: 'Projet', en: 'Project', ar: 'المشروع', de: 'Projekt' },
    href: '/project',
  },
  {
    label: { fr: 'Principes', en: 'Principles', ar: 'المبادئ', de: 'Prinzipien' },
    href: '/principles',
  },
  {
    label: { fr: 'À propos', en: 'About', ar: 'من نحن', de: 'Über uns' },
    href: '/about',
  },
  {
    label: { fr: 'Galerie', en: 'Gallery', ar: 'المعرض', de: 'Galerie' },
    href: '/gallery',
  },
  {
    label: { fr: 'Événements', en: 'Events', ar: 'الفعاليات', de: 'Veranstaltungen' },
    href: '/events',
  },
  {
    label: { fr: 'Actualités', en: 'News', ar: 'الأخبار', de: 'Aktuelles' },
    href: '/blog',
  },
  {
    label: { fr: 'Contact', en: 'Contact', ar: 'اتصل بنا', de: 'Kontakt' },
    href: '/contact',
  },
] as const;

/**
 * Primary navigation call-to-action.
 *
 * Kept out of `PRIMARY_NAV` so the header can render it with emphasis (a bordered clay link)
 * without that treatment leaking into ordinary nav items. Labels live in the i18n tables
 * under `navigation.ctaLabel` / `navigation.ctaAriaLabel`.
 */
export const NAV_CTA = {
  href: '/funding',
  labelKey: 'navigation.ctaLabel',
  ariaLabelKey: 'navigation.ctaAriaLabel',
} as const;

export const FOOTER_NAV = {
  discover: [
    {
      label: { fr: 'Le projet', en: 'The Project', ar: 'المشروع', de: 'Das Projekt' },
      href: '/project',
    },
    {
      label: { fr: 'Nos principes', en: 'Our Principles', ar: 'مبادئنا', de: 'Unsere Prinzipien' },
      href: '/principles',
    },
    {
      label: { fr: 'Équipe', en: 'Team', ar: 'الفريق', de: 'Team' },
      href: '/team',
    },
    {
      label: { fr: 'Partenaires', en: 'Partners', ar: 'الشركاء', de: 'Partner' },
      href: '/partners',
    },
    {
      label: {
        fr: 'Financement & Recherche',
        en: 'Funding & Research',
        ar: 'التمويل والبحث',
        de: 'Förderung & Forschung',
      },
      href: '/funding',
    },
  ],
  resources: [
    {
      label: { fr: 'Galerie', en: 'Gallery', ar: 'المعرض', de: 'Galerie' },
      href: '/gallery',
    },
    {
      label: { fr: 'Événements', en: 'Events', ar: 'الفعاليات', de: 'Veranstaltungen' },
      href: '/events',
    },
    {
      label: { fr: 'Actualités', en: 'News', ar: 'الأخبار', de: 'Aktuelles' },
      href: '/blog',
    },
    {
      label: { fr: 'FAQ', en: 'FAQ', ar: 'الأسئلة الشائعة', de: 'FAQ' },
      href: '/faq',
    },
  ],
  legal: [
    {
      label: { fr: 'Confidentialité', en: 'Privacy', ar: 'الخصوصية', de: 'Datenschutz' },
      href: '/legal/privacy',
    },
    {
      label: {
        fr: "Conditions d'utilisation",
        en: 'Terms of Use',
        ar: 'شروط الاستخدام',
        de: 'Nutzungsbedingungen',
      },
      href: '/legal/terms',
    },
    {
      label: { fr: 'Cookies', en: 'Cookies', ar: 'ملفات الارتباط', de: 'Cookies' },
      href: '/legal/cookies',
    },
  ],
} as const;
