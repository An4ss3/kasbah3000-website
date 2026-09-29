export interface RateLimitKV {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options: { expirationTtl: number }): Promise<void>;
}

/**
 * Independent rate-limit buckets. The first three are keyed by client IP, one per public write
 * endpoint. `acknowledgement` is keyed by the recipient address instead: it caps how many courtesy
 * emails a single inbox can receive per window, regardless of how many IPs submit it.
 */
export type RateLimitScope = 'contact' | 'newsletter' | 'event-registration' | 'acknowledgement';

export type RateLimitResult =
  | {
      available: true;
      allowed: boolean;
      remaining: number;
      retryAfter: number;
    }
  | {
      available: false;
      reason: 'missing-binding' | 'storage-error';
    };

export interface RateLimitOptions {
  kv?: RateLimitKV;
  development: boolean;
}

interface StoredCounter {
  count: number;
  expiresAt: number;
}

const WINDOW_SECONDS = 60 * 60;

/*
  Cloudflare KV rejects `expirationTtl` below 60 seconds. The TTL used to be the raw time left in
  the fixed window, so during the final minute of every hour `kv.put` threw, the catch below
  reported `storage-error`, and every public form endpoint answered 503 — a reproducible one-minute
  outage per hour. Clamping is safe: the key embeds `windowStart`, so an entry surviving a few
  seconds into the next window is never read again.
*/
const KV_MIN_EXPIRATION_TTL_SECONDS = 60;
const memoryCounters = new Map<string, StoredCounter>();

async function hashIdentifier(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function parseCounter(raw: string | null, expiresAt: number): StoredCounter {
  if (!raw) return { count: 0, expiresAt };

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'count' in parsed &&
      typeof parsed.count === 'number' &&
      Number.isSafeInteger(parsed.count) &&
      parsed.count >= 0
    ) {
      return { count: parsed.count, expiresAt };
    }
  } catch {
    // Invalid or stale values restart this fixed window.
  }

  return { count: 0, expiresAt };
}

function resultFor(count: number, limit: number, retryAfter: number): RateLimitResult {
  return {
    available: true,
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfter,
  };
}

/**
 * Fixed-window API limiter. RATE_LIMIT_KV is defense-in-depth and non-atomic
 * because Cloudflare KV is eventually consistent. Production fails closed when
 * KV is missing or errors; process-memory fallback is development-only.
 */
export async function consumeRateLimit(
  scope: RateLimitScope,
  ip: string,
  limit: number,
  { kv, development }: RateLimitOptions
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = Math.floor(now / (WINDOW_SECONDS * 1000)) * WINDOW_SECONDS * 1000;
  const expiresAt = windowStart + WINDOW_SECONDS * 1000;
  const retryAfter = Math.max(1, Math.ceil((expiresAt - now) / 1000));
  const identifier = await hashIdentifier(`${scope}:${ip}`);
  const key = `forms-rate-limit:${scope}:${windowStart}:${identifier}`;

  if (kv) {
    try {
      const counter = parseCounter(await kv.get(key), expiresAt);
      counter.count += 1;
      await kv.put(key, JSON.stringify(counter), {
        expirationTtl: Math.max(KV_MIN_EXPIRATION_TTL_SECONDS, retryAfter),
      });
      return resultFor(counter.count, limit, retryAfter);
    } catch {
      if (!development) return { available: false, reason: 'storage-error' };
    }
  } else if (!development) {
    return { available: false, reason: 'missing-binding' };
  }

  const current = memoryCounters.get(key);
  const counter = current && current.expiresAt > now ? current : { count: 0, expiresAt };
  counter.count += 1;
  memoryCounters.set(key, counter);

  for (const [storedKey, stored] of memoryCounters) {
    if (stored.expiresAt <= now) memoryCounters.delete(storedKey);
  }

  return resultFor(counter.count, limit, retryAfter);
}
