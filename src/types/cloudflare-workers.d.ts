/**
 * Minimal ambient declaration for the Cloudflare Workers runtime module.
 *
 * `Astro.locals.runtime.env` was removed in Astro v6, and the Cloudflare adapter now reads
 * bindings through `cloudflare:workers` (see `@astrojs/cloudflare/dist/utils/handler.js`). That
 * module ships no types here because `@cloudflare/workers-types` is not a dependency and the
 * technical stack is frozen (PROJECT_RULES §7.1), so no package is added.
 *
 * `wrangler types` was evaluated as the alternative and rejected: its generated
 * `worker-configuration.d.ts` injects the full Workers global scope, which shadows the DOM `lib`
 * and breaks client-side code (`document.head.append` stops resolving to the DOM overload).
 *
 * Bindings stay intentionally loosely typed: `getFormEnvironment` already narrows every value
 * through a `typeof value === 'string'` guard before use, so a precise `Env` shape would add no
 * safety here.
 */
declare module 'cloudflare:workers' {
  export const env: Record<string, unknown>;
}
