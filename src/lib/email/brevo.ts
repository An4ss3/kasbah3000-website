import type { FormEnvironment } from '@lib/api/forms';
import type { ContactInput, NewsletterInput } from '@lib/forms/schemas';

const BREVO_API_BASE = 'https://api.brevo.com/v3';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requiredString(value: string | undefined, name: string): string {
  const normalized = value?.trim();
  if (!normalized) throw new Error(`Missing ${name}`);
  return normalized;
}

function requiredEmail(value: string | undefined, name: string): string {
  const email = requiredString(value, name);
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) throw new Error(`Invalid ${name}`);
  return email;
}

function requiredPositiveInteger(value: string | undefined, name: string): number {
  const number = Number(requiredString(value, name));
  if (!Number.isSafeInteger(number) || number <= 0) throw new Error(`Invalid ${name}`);
  return number;
}

function requiredRedirectUrl(value: string | undefined): string {
  const candidate = requiredString(value, 'BREVO_DOI_REDIRECT_URL');
  const url = new URL(candidate);
  if (url.protocol !== 'https:') throw new Error('Invalid BREVO_DOI_REDIRECT_URL');
  return url.href;
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ??
      character
  );
}

async function postBrevo(
  path: string,
  apiKey: string,
  body: Record<string, unknown>
): Promise<void> {
  const response = await fetch(`${BREVO_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(`Brevo request failed with status ${response.status}`);
}

export async function sendContactEmail(
  input: ContactInput,
  environment: FormEnvironment
): Promise<void> {
  const apiKey = requiredString(environment.BREVO_API_KEY, 'BREVO_API_KEY');
  const senderEmail = requiredEmail(environment.BREVO_SENDER_EMAIL, 'BREVO_SENDER_EMAIL');
  const recipientEmail = requiredEmail(
    environment.CONTACT_RECIPIENT_EMAIL,
    'CONTACT_RECIPIENT_EMAIL'
  );

  const name = escapeHtml(input.name);
  const email = escapeHtml(input.email);
  const organization = escapeHtml(input.organization ?? '');
  const subject = escapeHtml(input.subject);
  const message = escapeHtml(input.message).replace(/\r?\n/g, '<br>');
  const language = escapeHtml(input.lang);

  const htmlContent = [
    `<p><strong>Name:</strong> ${name}</p>`,
    `<p><strong>Email:</strong> ${email}</p>`,
    organization ? `<p><strong>Organization:</strong> ${organization}</p>` : '',
    `<p><strong>Subject:</strong> ${subject}</p>`,
    `<p><strong>Language:</strong> ${language}</p>`,
    `<p><strong>Message:</strong><br>${message}</p>`,
  ].join('');

  await postBrevo('/smtp/email', apiKey, {
    sender: { name: 'Kasbah3000', email: senderEmail },
    to: [{ email: recipientEmail }],
    replyTo: { name: input.name, email: input.email },
    subject: `[Kasbah3000] Contact — ${input.subject}`,
    htmlContent,
  });
}

export async function subscribeNewsletterDoubleOptIn(
  input: NewsletterInput,
  environment: FormEnvironment
): Promise<void> {
  const apiKey = requiredString(environment.BREVO_API_KEY, 'BREVO_API_KEY');
  requiredEmail(environment.BREVO_SENDER_EMAIL, 'BREVO_SENDER_EMAIL');
  const listId = requiredPositiveInteger(
    environment.BREVO_NEWSLETTER_LIST_ID,
    'BREVO_NEWSLETTER_LIST_ID'
  );
  const templateId = requiredPositiveInteger(
    environment.BREVO_DOI_TEMPLATE_ID,
    'BREVO_DOI_TEMPLATE_ID'
  );
  const redirectionUrl = requiredRedirectUrl(environment.BREVO_DOI_REDIRECT_URL);

  await postBrevo('/contacts/doubleOptinConfirmation', apiKey, {
    email: input.email,
    includeListIds: [listId],
    templateId,
    redirectionUrl,
    attributes: { LANGUAGE: input.lang },
  });
}
