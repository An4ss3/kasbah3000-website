import { defineMiddleware } from 'astro:middleware';

/**
 * Security headers for Worker-rendered responses (§10.5 of PROJECT_RULES.md).
 *
 * Scope: Cloudflare Workers serves static assets ahead of the Worker script unless
 * `assets.run_worker_first` is enabled, so this middleware only runs for SSR
 * responses (the 404 fallback and `/api/*`). Prerendered pages receive their
 * headers from `public/_headers` instead.
 *
 * IMPORTANT: this policy is mirrored verbatim in `public/_headers`. Any change here
 * must be applied there too, otherwise static and SSR responses will diverge.
 *
 * Admin-route auth guards are added in Phase 8 (Day 11).
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  // src/styles/typography.css currently @imports Cormorant Garamond and Manrope from
  // Google Fonts. Remove both Google origins once the fonts are self-hosted in
  // /public/fonts (see the TODO in typography.css).
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://*.maptiler.com https://*.cloudflare.com",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://*.maptiler.com https://*.supabase.co https://challenges.cloudflare.com",
  // MapLibre GL JS (ESM build) instantiates its render worker from a blob URL.
  // Without these directives the worker is refused and ProjectMap degrades to its fallback.
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  'frame-src https://challenges.cloudflare.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();

  response.headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY);
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
});
