/**
 * Common Types
 * Shared TypeScript interfaces used across the application
 */

export type Language = 'fr' | 'en' | 'ar' | 'de';

/** Writing direction. Arabic renders right-to-left; every other locale is left-to-right. */
export type Direction = 'ltr' | 'rtl';

/**
 * A translated string.
 *
 * `fr` and `en` are authored for every record and act as the fallback chain. `ar` and `de`
 * are optional so that seed/GeoJSON content can be localised incrementally — resolve values
 * through `localize()` rather than indexing directly.
 */
export interface LocalizedString {
  fr: string;
  en: string;
  ar?: string;
  de?: string;
}

export interface SEOMetadata {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

export interface ImageAsset {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
}

export interface Link {
  label: string | LocalizedString;
  href: string;
  external?: boolean;
  icon?: string;
}

export interface Author {
  name: string;
  role?: string;
  avatar?: string;
  bio?: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

export interface Breadcrumb {
  label: string;
  href?: string;
}
