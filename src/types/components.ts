/**
 * Component Types
 * Shared prop interfaces for Astro/Preact components
 */

import type { Language, ImageAsset, Breadcrumb } from './common';

// Layout Components
export interface BaseLayoutProps {
  lang: Language;
  title: string;
  description?: string;
}

export interface PageLayoutProps extends BaseLayoutProps {
  showHero?: boolean;
}

// Navigation
export interface NavProps {
  lang: Language;
  currentPath: string;
}

export interface BreadcrumbsProps {
  items: Breadcrumb[];
  lang: Language;
}

// Hero
export interface HeroProps {
  eyebrow?: string;
  headline: string;
  headlineAccent?: string; // italic portion
  description?: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
}

export interface HeroVideoProps {
  videoSrc: string;
  videoSrcWebm?: string;
  posterSrc: string;
}

// Content Components
export interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  centered?: boolean;
}

export interface CardProps {
  href?: string;
  bordered?: boolean;
}

export interface ButtonProps {
  variant: 'primary-dark' | 'primary-light' | 'outline';
  href?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

// Form Components
export interface InputProps {
  type: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'select';
  name: string;
  label: string;
  required?: boolean;
  error?: string;
  options?: string[];
}

// Island Components (Preact)
export interface ProjectMapProps {
  featuresUrl: string;
  center?: [number, number];
  zoom?: number;
  lang: Language;
  ariaLabel?: string;
  fallbackText?: string;
}

export interface LightboxProps {
  images: ImageAsset[];
  initialIndex?: number;
}

export interface FormProps {
  lang: Language;
  turnstileSiteKey: string;
}
