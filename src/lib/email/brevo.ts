import type { FormEnvironment } from '@lib/api/forms';
import { t } from '@lib/utils/i18n';
import type { ContactInput, NewsletterInput, WebinarRegistrationInput } from '@lib/forms/schemas';

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

/**
 * Notify the project inbox of a webinar / event registration request.
 *
 * Reuses the same transactional Brevo endpoint and environment variables as the contact
 * form, so no additional credentials are required beyond those already documented.
 */
export async function sendWebinarRegistrationEmail(
  input: WebinarRegistrationInput,
  eventTitle: string,
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
  const questions = escapeHtml(input.questions ?? '').replace(/\r?\n/g, '<br>');
  const language = escapeHtml(input.lang);
  const slug = escapeHtml(input.eventSlug);
  const title = escapeHtml(eventTitle);

  const htmlContent = [
    `<p><strong>Event:</strong> ${title} (${slug})</p>`,
    `<p><strong>Name:</strong> ${name}</p>`,
    `<p><strong>Email:</strong> ${email}</p>`,
    organization ? `<p><strong>Organization:</strong> ${organization}</p>` : '',
    `<p><strong>Language:</strong> ${language}</p>`,
    questions ? `<p><strong>Questions:</strong><br>${questions}</p>` : '',
  ].join('');

  await postBrevo('/smtp/email', apiKey, {
    sender: { name: 'Kasbah3000', email: senderEmail },
    to: [{ email: recipientEmail }],
    replyTo: { name: input.name, email: input.email },
    subject: `[Kasbah3000] Registration — ${eventTitle}`,
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

/*
 * Acknowledgement emails sent to the person who submitted the form.
 *
 * These are secondary to the internal notification: the team must be told about a lead even if the
 * courtesy reply fails, so the API routes send the notification first and treat the acknowledgement
 * as best-effort. Copy is localized through the shared `t()` helper, so all four locales are
 * covered by the same translation tables the UI uses.
 *
 * `replyTo` points at the project inbox so a reply from the visitor reaches the team rather than a
 * no-reply address.
 */
function acknowledgementLayout(paragraphs: readonly string[], signature: string): string {
  return [
    ...paragraphs.map((paragraph) => `<p>${paragraph}</p>`),
    `<p style="margin-top:24px">${signature}</p>`,
  ].join('');
}

export async function sendContactAcknowledgement(
  input: ContactInput,
  environment: FormEnvironment
): Promise<void> {
  const apiKey = requiredString(environment.BREVO_API_KEY, 'BREVO_API_KEY');
  const senderEmail = requiredEmail(environment.BREVO_SENDER_EMAIL, 'BREVO_SENDER_EMAIL');
  const recipientEmail = requiredEmail(
    environment.CONTACT_RECIPIENT_EMAIL,
    'CONTACT_RECIPIENT_EMAIL'
  );
  const lang = input.lang;

  const htmlContent = acknowledgementLayout(
    [
      `${escapeHtml(t(lang, 'email.contact.ack.greeting'))} ${escapeHtml(input.name)},`,
      escapeHtml(t(lang, 'email.contact.ack.body')),
      `<strong>${escapeHtml(t(lang, 'email.contact.ack.recap'))}</strong><br>${escapeHtml(
        input.message
      ).replace(/\r?\n/g, '<br>')}`,
    ],
    escapeHtml(t(lang, 'email.contact.ack.signature'))
  );

  await postBrevo('/smtp/email', apiKey, {
    sender: { name: 'Kasbah3000', email: senderEmail },
    to: [{ email: input.email, name: input.name }],
    replyTo: { name: 'Kasbah3000', email: recipientEmail },
    subject: t(lang, 'email.contact.ack.subject'),
    htmlContent,
  });
}

export async function sendWebinarRegistrationAcknowledgement(
  input: WebinarRegistrationInput,
  eventTitle: string,
  environment: FormEnvironment
): Promise<void> {
  const apiKey = requiredString(environment.BREVO_API_KEY, 'BREVO_API_KEY');
  const senderEmail = requiredEmail(environment.BREVO_SENDER_EMAIL, 'BREVO_SENDER_EMAIL');
  const recipientEmail = requiredEmail(
    environment.CONTACT_RECIPIENT_EMAIL,
    'CONTACT_RECIPIENT_EMAIL'
  );
  const lang = input.lang;

  const htmlContent = acknowledgementLayout(
    [
      `${escapeHtml(t(lang, 'email.registration.ack.greeting'))} ${escapeHtml(input.name)},`,
      escapeHtml(t(lang, 'email.registration.ack.body')),
      `<strong>${escapeHtml(t(lang, 'email.registration.ack.recap'))}</strong><br>${escapeHtml(
        t(lang, 'email.registration.ack.eventLabel')
      )}: ${escapeHtml(eventTitle)}`,
    ],
    escapeHtml(t(lang, 'email.registration.ack.signature'))
  );

  await postBrevo('/smtp/email', apiKey, {
    sender: { name: 'Kasbah3000', email: senderEmail },
    to: [{ email: input.email, name: input.name }],
    replyTo: { name: 'Kasbah3000', email: recipientEmail },
    subject: t(lang, 'email.registration.ack.subject'),
    htmlContent,
  });
}
