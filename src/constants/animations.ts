/**
 * Animation Configuration
 * Frozen per PROJECT_RULES.md
 * Character: Calm, architectural, barely-there
 */

export const DURATIONS = {
  fast: 150, // ms - hover/micro
  default: 200, // ms - standard
  reveal: 500, // ms - scroll reveals
  slow: 800, // ms - hero/video fade
  accordion: 300, // ms
  lightbox: 250, // ms
} as const;

export const EASINGS = {
  default: 'ease-out',
  reveal: 'cubic-bezier(0.16, 1, 0.3, 1)', // out-expo-soft
} as const;

export const SCROLL_REVEAL = {
  threshold: 0.2, // IntersectionObserver
  stagger: 80, // ms between group items
  maxStagger: 4, // max items to stagger
  translateY: 24, // px
} as const;

// Forbidden techniques (for reference only)
export const FORBIDDEN_ANIMATIONS = [
  'bounce',
  'elastic',
  'spring',
  'parallax',
  'scroll-jacking',
  'rotation (except accordion ±45°)',
  'blur-transitions',
  'letter-spacing-animation',
  'marquees',
  'auto-advancing-carousels',
] as const;
