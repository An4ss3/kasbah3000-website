import type { APIRoute } from 'astro';
import { getClientIp, getFormEnvironment, jsonFormResponse, readJsonRequest } from '@lib/api/forms';
import { sendContactAcknowledgement, sendContactEmail } from '@lib/email/brevo';
import { contactSchema } from '@lib/forms/schemas';
import { verifyTurnstile } from '@lib/security/turnstile';
import { consumeRateLimit } from '@lib/utils/rate-limit';

export const prerender = false;

/** Maximum courtesy emails a single recipient address can receive per hour. */
const ACKNOWLEDGEMENT_LIMIT_PER_HOUR = 3;

export const POST: APIRoute = async ({ request }) => {
  const body = await readJsonRequest(request);
  if (!body.ok) return jsonFormResponse(body.status, body.code);

  const parsed = contactSchema.safeParse(body.value);
  if (!parsed.success) return jsonFormResponse(400, 'INVALID_REQUEST');

  if (parsed.data.website.trim()) return jsonFormResponse(200, 'CONTACT_SENT', true);

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
  const rateLimit = await consumeRateLimit('contact', clientIp, 5, {
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
    'contact_submit',
    expectedHostname
  );
  if (!verified) return jsonFormResponse(400, 'TURNSTILE_FAILED', false, rateHeaders);

  try {
    await sendContactEmail(parsed.data, environment);
  } catch {
    return jsonFormResponse(503, 'SERVICE_UNAVAILABLE', false, rateHeaders);
  }

  /*
    Courtesy acknowledgement to the sender, sent after the team notification. It is awaited, but a
    failure is swallowed: the lead is already captured, so it must not turn a successful submission
    into an error. The Brevo call is bounded by a timeout, which caps the added latency.

    The recipient address is visitor-supplied, so it is rate limited on its own, independently of
    the IP limit above: a single inbox receives at most a few acknowledgements per hour no matter
    how many addresses submit it. When that limit is hit or unavailable, only the courtesy email is
    skipped; the submission itself still succeeds.
  */
  const acknowledgementLimit = await consumeRateLimit(
    'acknowledgement',
    parsed.data.email.trim().toLowerCase(),
    ACKNOWLEDGEMENT_LIMIT_PER_HOUR,
    { kv: environment.RATE_LIMIT_KV, development: import.meta.env.DEV }
  );

  if (acknowledgementLimit.available && acknowledgementLimit.allowed) {
    try {
      await sendContactAcknowledgement(parsed.data, environment);
    } catch {
      console.error('Contact acknowledgement could not be delivered');
    }
  }

  return jsonFormResponse(200, 'CONTACT_SENT', true, rateHeaders);
};

export const ALL: APIRoute = () =>
  jsonFormResponse(405, 'METHOD_NOT_ALLOWED', false, { Allow: 'POST' });
