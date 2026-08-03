/**
 * Breakpoints Configuration
 * Frozen per PROJECT_RULES.md (Tailwind defaults)
 */

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const CONTAINER_WIDTHS = {
  content: 1180, // px
  wide: 1280, // px
  prose: 560, // px
  headline: 1050, // px
} as const;

export const GUTTERS = {
  mobile: 20, // px (px-5)
  tablet: 32, // px (px-8)
  desktop: 48, // px (px-12)
} as const;

export const SECTION_PADDING = {
  mobile: 56, // px (py-14)
  tablet: 80, // px (py-20)
  desktop: 120, // px (py-30)
  heroAdjacent: 152, // px (py-38)
} as const;
