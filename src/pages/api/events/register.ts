import type { APIRoute } from 'astro';
import { getClientIp, getFormEnvironment, jsonFormResponse, readJsonRequest } from '@lib/api/forms';
import { getEventBySlug } from '@lib/content/events';
import {
  sendWebinarRegistrationAcknowledgement,
  sendWebinarRegistrationEmail,
} from '@lib/email/brevo';
import { webinarRegistrationSchema } from '@lib/forms/schemas';
import { verifyTurnstile } from '@lib/security/turnstile';
import { localize } from '@lib/utils/i18n';
import { consumeRateLimit } from '@lib/utils/rate-limit';

export const prerender = false;

/**
 * Webinar / event registration endpoint.
 *
 * Mirrors `/api/contact`: Turnstile verification, KV-backed rate limiting and a Brevo
 * transactional email, using the same environment variables. Requires BREVO_API_KEY,
 * BREVO_SENDER_EMAIL, CONTACT_RECIPIENT_EMAIL, TURNSTILE_SECRET_KEY and PUBLIC_SITE_URL —
 * without them the route answers SERVICE_UNAVAILABLE rather than reporting a false success.
 */
export const POST: APIRoute = async ({ request }) => {
  const body = await readJsonRequest(request);
  if (!body.ok) return jsonFormResponse(body.status, body.code);

  const parsed = webinarRegistrationSchema.safeParse(body.value);
  if (!parsed.success) return jsonFormResponse(400, 'INVALID_REQUEST');

  // Honeypot: acknowledge without sending so bots get no signal.
  if (parsed.data.website.trim()) return jsonFormResponse(200, 'REGISTRATION_RECEIVED', true);

  // Only accept registrations for events that actually exist and are published.
  const event = await getEventBySlug(parsed.data.eventSlug);
  if (!event) return jsonFormResponse(404, 'UNKNOWN_EVENT');

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
  const rateLimit = await consumeRateLimit('event-registration', clientIp, 5, {
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
    'webinar_register',
    expectedHostname
  );
  if (!verified) return jsonFormResponse(400, 'TURNSTILE_FAILED', false, rateHeaders);

  const eventTitle = localize(event.title, parsed.data.lang);

  try {
    await sendWebinarRegistrationEmail(parsed.data, eventTitle, environment);
  } catch {
    return jsonFormResponse(503, 'SERVICE_UNAVAILABLE', false, rateHeaders);
  }

  /*
    Confirmation to the registrant. Sent after the team notification and kept outside the response
    path: the registration is already recorded, so a delivery failure here must not report an error
    to someone who did sign up successfully.
  */
  try {
    await sendWebinarRegistrationAcknowledgement(parsed.data, eventTitle, environment);
  } catch {
    console.error('Registration acknowledgement could not be delivered');
  }

  return jsonFormResponse(200, 'REGISTRATION_RECEIVED', true, rateHeaders);
};

export const ALL: APIRoute = () =>
  jsonFormResponse(405, 'METHOD_NOT_ALLOWED', false, { Allow: 'POST' });
