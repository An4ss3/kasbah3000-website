const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface TurnstileVerificationResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
  action?: string;
}

function isVerificationResponse(value: unknown): value is TurnstileVerificationResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    typeof value.success === 'boolean'
  );
}

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/\.+$/, '');
}

export async function verifyTurnstile(
  secret: string,
  token: string,
  remoteIp: string | undefined,
  expectedAction: string,
  expectedHostname: string
): Promise<boolean> {
  const normalizedExpectedHostname = normalizeHostname(expectedHostname);
  if (!secret.trim() || !token.trim() || !expectedAction || !normalizedExpectedHostname) {
    return false;
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!response.ok) return false;

    const payload: unknown = await response.json();
    return (
      isVerificationResponse(payload) &&
      payload.success &&
      payload.action === expectedAction &&
      typeof payload.hostname === 'string' &&
      normalizeHostname(payload.hostname) === normalizedExpectedHostname
    );
  } catch {
    return false;
  }
}
