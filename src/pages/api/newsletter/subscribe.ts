import type { APIRoute } from 'astro';
import { getClientIp, getFormEnvironment, jsonFormResponse, readJsonRequest } from '@lib/api/forms';
import { subscribeNewsletterDoubleOptIn } from '@lib/email/brevo';
import { newsletterSchema } from '@lib/forms/schemas';
import { verifyTurnstile } from '@lib/security/turnstile';
import { consumeRateLimit } from '@lib/utils/rate-limit';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await readJsonRequest(request);
  if (!body.ok) return jsonFormResponse(body.status, body.code);

  const parsed = newsletterSchema.safeParse(body.value);
  if (!parsed.success) return jsonFormResponse(400, 'INVALID_REQUEST');

  if (parsed.data.website.trim()) return jsonFormResponse(200, 'NEWSLETTER_PENDING', true);

  const environment = getFormEnvironment();
  let expectedHostname: string;
  try {
    const siteUrl = environment.PUBLIC_SITE_URL?.trim();
    if (!siteUrl) throw new Error('Missing PUBLIC_SITE_URL');
    expectedHostname = new URL(siteUrl).hostname.toLowerCase().replace(/\.+$/, '');
    if (!expectedHostname) throw new Error('Invalid PUBLIC_SITE_URL');
  } catch {
    return jsonFormResponse(503, 'SERVICE_UNAVAILABLE');
  }

  const clientIp = getClientIp(request, import.meta.env.DEV);
  const rateLimit = await consumeRateLimit('newsletter', clientIp, 3, {
    kv: environment.RATE_LIMIT_KV,
    development: import.meta.env.DEV,
  });
  if (!rateLimit.available) return jsonFormResponse(503, 'SERVICE_UNAVAILABLE');

  const rateHeaders = { 'X-RateLimit-Remaining': String(rateLimit.remaining) };
  if (!rateLimit.allowed) {
    return jsonFormResponse(429, 'RATE_LIMITED', false, {
      ...rateHeaders,
      'Retry-After': String(rateLimit.retryAfter),
    });
  }

  const turnstileSecret = environment.TURNSTILE_SECRET_KEY?.trim();
  if (!turnstileSecret) return jsonFormResponse(503, 'SERVICE_UNAVAILABLE', false, rateHeaders);

  const verified = await verifyTurnstile(
    turnstileSecret,
    parsed.data.turnstileToken,
    clientIp === 'unknown' ? undefined : clientIp,
    'newsletter_subscribe',
    expectedHostname
  );
  if (!verified) return jsonFormResponse(400, 'TURNSTILE_FAILED', false, rateHeaders);

  try {
    await subscribeNewsletterDoubleOptIn(parsed.data, environment);
    return jsonFormResponse(200, 'NEWSLETTER_PENDING', true, rateHeaders);
  } catch (error) {
    console.error(
      `Newsletter notification failed: ${error instanceof Error ? error.message : 'unknown'}`
    );
    return jsonFormResponse(503, 'SERVICE_UNAVAILABLE', false, rateHeaders);
  }
};

export const ALL: APIRoute = () =>
  jsonFormResponse(405, 'METHOD_NOT_ALLOWED', false, { Allow: 'POST' });
