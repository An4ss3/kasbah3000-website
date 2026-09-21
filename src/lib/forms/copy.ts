import { t } from '@lib/utils/i18n';
import type { Language } from '@types';
import type { ContactSubject } from './schemas';

export interface SharedFormCopy {
  required: string;
  optional: string;
  requiredNote: string;
  websiteLabel: string;
  submitting: string;
  genericError: string;
  rateLimited: string;
  serviceUnavailable: string;
  turnstileUnavailable: string;
  turnstileRequired: string;
  validation: {
    name: string;
    email: string;
    organization: string;
    subject: string;
    message: string;
    consent: string;
  };
}

export interface ContactFormCopy extends SharedFormCopy {
  formLabel: string;
  nameLabel: string;
  emailLabel: string;
  organizationLabel: string;
  subjectLabel: string;
  subjectPlaceholder: string;
  subjectOptions: Record<ContactSubject, string>;
  messageLabel: string;
  consentPrefix: string;
  consentLink: string;
  consentSuffix: string;
  submit: string;
  success: string;
}

export interface NewsletterFormCopy extends SharedFormCopy {
  formLabel: string;
  emailLabel: string;
  emailPlaceholder: string;
  consentPrefix: string;
  consentLink: string;
  consentSuffix: string;
  submit: string;
  success: string;
}

export interface WebinarRegistrationFormCopy extends SharedFormCopy {
  formLabel: string;
  nameLabel: string;
  emailLabel: string;
  organizationLabel: string;
  questionsLabel: string;
  consentPrefix: string;
  consentLink: string;
  consentSuffix: string;
  submit: string;
  success: string;
  questionsError: string;
}

function getSharedFormCopy(lang: Language): SharedFormCopy {
  return {
    required: t(lang, 'forms.required'),
    optional: t(lang, 'forms.optional'),
    requiredNote: t(lang, 'forms.requiredNote'),
    websiteLabel: t(lang, 'forms.websiteLabel'),
    submitting: t(lang, 'forms.status.submitting'),
    genericError: t(lang, 'forms.status.error'),
    rateLimited: t(lang, 'forms.status.rateLimited'),
    serviceUnavailable: t(lang, 'forms.status.serviceUnavailable'),
    turnstileUnavailable: t(lang, 'forms.status.turnstileUnavailable'),
    turnstileRequired: t(lang, 'forms.status.turnstileRequired'),
    validation: {
      name: t(lang, 'forms.validation.name'),
      email: t(lang, 'forms.validation.email'),
      organization: t(lang, 'forms.validation.organization'),
      subject: t(lang, 'forms.validation.subject'),
      message: t(lang, 'forms.validation.message'),
      consent: t(lang, 'forms.validation.consent'),
    },
  };
}

export function getContactFormCopy(lang: Language): ContactFormCopy {
  return {
    ...getSharedFormCopy(lang),
    formLabel: t(lang, 'contact.form.label'),
    nameLabel: t(lang, 'contact.form.name'),
    emailLabel: t(lang, 'contact.form.email'),
    organizationLabel: t(lang, 'contact.form.organization'),
    subjectLabel: t(lang, 'contact.form.subject'),
    subjectPlaceholder: t(lang, 'contact.form.subjectPlaceholder'),
    subjectOptions: {
      partnership: t(lang, 'contact.form.subject.partnership'),
      visit: t(lang, 'contact.form.subject.visit'),
      residency: t(lang, 'contact.form.subject.residency'),
      press: t(lang, 'contact.form.subject.press'),
      other: t(lang, 'contact.form.subject.other'),
    },
    messageLabel: t(lang, 'contact.form.message'),
    consentPrefix: t(lang, 'contact.form.consentPrefix'),
    consentLink: t(lang, 'contact.form.consentLink'),
    consentSuffix: t(lang, 'contact.form.consentSuffix'),
    submit: t(lang, 'contact.form.submit'),
    success: t(lang, 'contact.form.success'),
  };
}

export function getNewsletterFormCopy(lang: Language): NewsletterFormCopy {
  return {
    ...getSharedFormCopy(lang),
    formLabel: t(lang, 'newsletter.form.label'),
    emailLabel: t(lang, 'newsletter.form.email'),
    emailPlaceholder: t(lang, 'newsletter.form.emailPlaceholder'),
    consentPrefix: t(lang, 'newsletter.form.consentPrefix'),
    consentLink: t(lang, 'newsletter.form.consentLink'),
    consentSuffix: t(lang, 'newsletter.form.consentSuffix'),
    submit: t(lang, 'newsletter.form.submit'),
    success: t(lang, 'newsletter.form.success'),
  };
}

export function getWebinarRegistrationFormCopy(lang: Language): WebinarRegistrationFormCopy {
  return {
    ...getSharedFormCopy(lang),
    formLabel: t(lang, 'registration.form.label'),
    nameLabel: t(lang, 'registration.form.name'),
    emailLabel: t(lang, 'registration.form.email'),
    organizationLabel: t(lang, 'registration.form.organization'),
    questionsLabel: t(lang, 'registration.form.questions'),
    consentPrefix: t(lang, 'registration.form.consentPrefix'),
    consentLink: t(lang, 'registration.form.consentLink'),
    consentSuffix: t(lang, 'registration.form.consentSuffix'),
    submit: t(lang, 'registration.form.submit'),
    success: t(lang, 'registration.form.success'),
    questionsError: t(lang, 'registration.validation.questions'),
  };
}
