/**
 * Common Types
 * Shared TypeScript interfaces used across the application
 */

export type Language = 'fr' | 'en'; // ar, es, zgh in Phase 7

export interface LocalizedString {
  fr: string;
  en: string;
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
