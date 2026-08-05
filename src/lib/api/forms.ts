import type { FormApiResponse, FormResponseCode } from '@lib/forms/schemas';
import type { RateLimitKV } from '@lib/utils/rate-limit';

export const MAX_FORM_BODY_BYTES = 16 * 1024;

export interface FormEnvironment {
  PUBLIC_SITE_URL?: string;
  BREVO_API_KEY?: string;
  BREVO_SENDER_EMAIL?: string;
  CONTACT_RECIPIENT_EMAIL?: string;
  BREVO_NEWSLETTER_LIST_ID?: string;
  BREVO_DOI_TEMPLATE_ID?: string;
  BREVO_DOI_REDIRECT_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
  RATE_LIMIT_KV?: RateLimitKV;
}

type RequestReadResult =
  { ok: true; value: unknown } | { ok: false; status: number; code: FormResponseCode };

function recordOf(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function stringValue(
  runtimeEnv: Record<string, unknown>,
  key: keyof FormEnvironment
): string | undefined {
  const value = runtimeEnv[key];
  return typeof value === 'string' ? value : undefined;
}

function rateLimitBinding(value: unknown): RateLimitKV | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const candidate = value as Partial<RateLimitKV>;
  return typeof candidate.get === 'function' && typeof candidate.put === 'function'
    ? (value as RateLimitKV)
    : undefined;
}

export function getFormEnvironment(locals: unknown): FormEnvironment {
  const runtime = recordOf(recordOf(locals).runtime);
  const runtimeEnv = recordOf(runtime.env);

  return {
    PUBLIC_SITE_URL: stringValue(runtimeEnv, 'PUBLIC_SITE_URL') ?? import.meta.env.PUBLIC_SITE_URL,
    BREVO_API_KEY: stringValue(runtimeEnv, 'BREVO_API_KEY') ?? import.meta.env.BREVO_API_KEY,
    BREVO_SENDER_EMAIL:
      stringValue(runtimeEnv, 'BREVO_SENDER_EMAIL') ?? import.meta.env.BREVO_SENDER_EMAIL,
    CONTACT_RECIPIENT_EMAIL:
      stringValue(runtimeEnv, 'CONTACT_RECIPIENT_EMAIL') ?? import.meta.env.CONTACT_RECIPIENT_EMAIL,
    BREVO_NEWSLETTER_LIST_ID:
      stringValue(runtimeEnv, 'BREVO_NEWSLETTER_LIST_ID') ??
      import.meta.env.BREVO_NEWSLETTER_LIST_ID,
    BREVO_DOI_TEMPLATE_ID:
      stringValue(runtimeEnv, 'BREVO_DOI_TEMPLATE_ID') ?? import.meta.env.BREVO_DOI_TEMPLATE_ID,
    BREVO_DOI_REDIRECT_URL:
      stringValue(runtimeEnv, 'BREVO_DOI_REDIRECT_URL') ?? import.meta.env.BREVO_DOI_REDIRECT_URL,
    TURNSTILE_SECRET_KEY:
      stringValue(runtimeEnv, 'TURNSTILE_SECRET_KEY') ?? import.meta.env.TURNSTILE_SECRET_KEY,
    RATE_LIMIT_KV: rateLimitBinding(runtimeEnv.RATE_LIMIT_KV),
  };
}

function isStrictIpv4(value: string): boolean {
  const octets = value.split('.');
  return (
    octets.length === 4 &&
    octets.every(
      (octet) =>
        /^\d{1,3}$/.test(octet) &&
        (octet === '0' || !octet.startsWith('0')) &&
        Number(octet) >= 0 &&
        Number(octet) <= 255
    )
  );
}

function isStrictIpv6(value: string): boolean {
  if (
    value.length < 2 ||
    value.length > 45 ||
    !value.includes(':') ||
    value.includes(':::') ||
    (value.startsWith(':') && !value.startsWith('::')) ||
    (value.endsWith(':') && !value.endsWith('::')) ||
    value.includes('%') ||
    !/^[0-9a-f:.]+$/i.test(value)
  ) {
    return false;
  }

  const compressedParts = value.split('::');
  if (compressedParts.length > 2) return false;

  const groups = value.split(':').filter(Boolean);
  const ipv4Index = groups.findIndex((group) => group.includes('.'));
  if (
    ipv4Index !== -1 &&
    (ipv4Index !== groups.length - 1 ||
      !isStrictIpv4(groups[ipv4Index]) ||
      !value.endsWith(groups[ipv4Index]))
  ) {
    return false;
  }

  let groupUnits = 0;
  for (const [index, group] of groups.entries()) {
    if (index === ipv4Index) {
      groupUnits += 2;
    } else if (/^[0-9a-f]{1,4}$/i.test(group)) {
      groupUnits += 1;
    } else {
      return false;
    }
  }

  return compressedParts.length === 2 ? groupUnits < 8 : groupUnits === 8;
}

function parseClientIp(value: string | null): string {
  const candidate = value?.trim() ?? '';
  return isStrictIpv4(candidate) || isStrictIpv6(candidate) ? candidate : 'unknown';
}

export function getClientIp(request: Request, trustForwardedFor = false): string {
  const connectingIp = request.headers.get('CF-Connecting-IP');
  if (connectingIp !== null) return parseClientIp(connectingIp);
  if (!trustForwardedFor) return 'unknown';

  const forwardedIp = request.headers.get('x-forwarded-for')?.split(',', 1)[0] ?? null;
  return parseClientIp(forwardedIp);
}

export async function readJsonRequest(request: Request): Promise<RequestReadResult> {
  const contentType =
    request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() ?? '';
  if (contentType !== 'application/json') {
    return { ok: false, status: 415, code: 'UNSUPPORTED_MEDIA_TYPE' };
  }

  const contentLength = request.headers.get('content-length');
  if (contentLength !== null) {
    if (!/^\d+$/.test(contentLength)) {
      return { ok: false, status: 400, code: 'INVALID_REQUEST' };
    }

    const declaredLength = Number(contentLength);
    if (!Number.isSafeInteger(declaredLength) || declaredLength > MAX_FORM_BODY_BYTES) {
      return { ok: false, status: 413, code: 'PAYLOAD_TOO_LARGE' };
    }
  }

  if (!request.body) return { ok: false, status: 400, code: 'INVALID_REQUEST' };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > MAX_FORM_BODY_BYTES) {
        try {
          await reader.cancel();
        } catch {
          // The stream may already have failed while the over-limit chunk was delivered.
        }
        return { ok: false, status: 413, code: 'PAYLOAD_TOO_LARGE' };
      }
      chunks.push(value);
    }

    const bytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, status: 400, code: 'INVALID_REQUEST' };
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // Ignore cleanup failures after a stream read or cancellation error.
    }
  }
}

export function jsonFormResponse(
  status: number,
  code: FormResponseCode,
  success = false,
  extraHeaders?: HeadersInit
): Response {
  const headers = new Headers(extraHeaders);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');
  headers.set('x-content-type-options', 'nosniff');

  const payload: FormApiResponse = { success, code };
  return new Response(JSON.stringify(payload), { status, headers });
}
