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

/*
  The site is reachable on both the apex (`kasbah3000.com`, PUBLIC_SITE_URL) and `www.`. Turnstile
  reports the hostname the widget was actually solved on, so accepting only the apex rejected every
  valid submission made from `www.` — tokens verified with success=true were then refused here, and
  no email was ever sent. Only the exact apex and its `www.` form are accepted: any other hostname,
  including other subdomains, is still rejected.
*/
function isAllowedHostname(actual: string, expected: string): boolean {
  const host = normalizeHostname(actual);
  return host === expected || host === `www.${expected}`;
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
    const verified =
      isVerificationResponse(payload) &&
      payload.success &&
      payload.action === expectedAction &&
      typeof payload.hostname === 'string' &&
      isAllowedHostname(payload.hostname, normalizedExpectedHostname);

    // Without this, a rejected token was indistinguishable from any other failure in the logs.
    // Only Turnstile's own error codes and the action/hostname match are logged — no token, no IP.
    if (!verified && isVerificationResponse(payload)) {
      console.warn(
        `Turnstile rejected: success=${payload.success} errors=${(payload['error-codes'] ?? []).join(',') || 'none'} ` +
          `actionMatch=${payload.action === expectedAction} hostnameMatch=${
            typeof payload.hostname === 'string' &&
            isAllowedHostname(payload.hostname, normalizedExpectedHostname)
          }`
      );
    }
    return verified;
  } catch {
    console.warn('Turnstile verification request failed');
    return false;
  }
}
