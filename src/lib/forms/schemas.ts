import { z } from 'zod';

const emailSchema = z.string().trim().max(254).pipe(z.email());
const honeypotSchema = z.string().trim().max(200).optional().default('');

/**
 * Locales accepted by the form endpoints. Must stay in sync with `SITE.languages`;
 * previously this only allowed fr/en, which rejected valid Arabic and German submissions.
 */
const langSchema = z.enum(['fr', 'en', 'ar', 'de']);

/** Rejects control and format characters that would let a value smuggle markup or headers. */
const noControlChars = (value: string) => !/[\p{Cc}\p{Cf}]/u.test(value);

export const contactSubjectSchema = z.enum(['partnership', 'visit', 'residency', 'press', 'other']);

export const contactSchema = z.object({
  name: z.string().refine(noControlChars).trim().min(2).max(100),
  email: emailSchema,
  organization: z.string().trim().max(120).optional().default(''),
  subject: contactSubjectSchema,
  message: z.string().trim().min(20).max(4000),
  consent: z.literal(true),
  website: honeypotSchema,
  lang: langSchema,
  turnstileToken: z.string().trim().min(1).max(2048),
});

export const contactClientSchema = contactSchema.omit({
  lang: true,
  turnstileToken: true,
});

export const newsletterSchema = z.object({
  email: emailSchema,
  consent: z.literal(true),
  website: honeypotSchema,
  lang: langSchema,
  turnstileToken: z.string().trim().min(1).max(2048),
});

export const newsletterClientSchema = newsletterSchema.omit({
  lang: true,
  turnstileToken: true,
});

/**
 * Webinar / event registration.
 *
 * `eventSlug` identifies the event record the request belongs to; the endpoint validates it
 * against published events so submissions cannot reference arbitrary strings. `questions` is
 * optional so the same form serves both a confirmed registration and an interest signup.
 */
export const webinarRegistrationSchema = z.object({
  eventSlug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().refine(noControlChars).trim().min(2).max(100),
  email: emailSchema,
  organization: z.string().trim().max(120).optional().default(''),
  questions: z.string().trim().max(2000).optional().default(''),
  consent: z.literal(true),
  website: honeypotSchema,
  lang: langSchema,
  turnstileToken: z.string().trim().min(1).max(2048),
});

export const webinarRegistrationClientSchema = webinarRegistrationSchema.omit({
  eventSlug: true,
  lang: true,
  turnstileToken: true,
});

export type ContactSubject = z.infer<typeof contactSubjectSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ContactClientInput = z.input<typeof contactClientSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type NewsletterClientInput = z.input<typeof newsletterClientSchema>;
export type WebinarRegistrationInput = z.infer<typeof webinarRegistrationSchema>;
export type WebinarRegistrationClientInput = z.input<typeof webinarRegistrationClientSchema>;

export type FormResponseCode =
  | 'CONTACT_SENT'
  | 'NEWSLETTER_PENDING'
  | 'REGISTRATION_RECEIVED'
  | 'UNKNOWN_EVENT'
  | 'INVALID_REQUEST'
  | 'PAYLOAD_TOO_LARGE'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'RATE_LIMITED'
  | 'TURNSTILE_FAILED'
  | 'SERVICE_UNAVAILABLE'
  | 'METHOD_NOT_ALLOWED';

export interface FormApiResponse {
  success: boolean;
  code: FormResponseCode;
}

export function isFormResponse(value: unknown): value is FormApiResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    typeof value.success === 'boolean' &&
    'code' in value &&
    typeof value.code === 'string'
  );
}
