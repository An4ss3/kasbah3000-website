import { useEffect, useId, useRef, useState } from 'preact/hooks';
import type { WebinarRegistrationFormCopy } from '@lib/forms/copy';
import { isFormResponse, webinarRegistrationClientSchema } from '@lib/forms/schemas';
import { useTurnstile } from '@lib/forms/use-turnstile';
import type { Language } from '@types';

interface Props {
  lang: Language;
  /** Slug of the event this registration belongs to; validated server-side. */
  eventSlug: string;
  turnstileSiteKey: string;
  privacyHref: string;
  copy: WebinarRegistrationFormCopy;
}

type RegistrationField = 'name' | 'email' | 'organization' | 'questions' | 'consent';

type RegistrationErrors = Partial<Record<RegistrationField, string>>;

interface RegistrationValues {
  name: string;
  email: string;
  organization: string;
  questions: string;
  consent: boolean;
  website: string;
}

const EMPTY_VALUES: RegistrationValues = {
  name: '',
  email: '',
  organization: '',
  questions: '',
  consent: false,
  website: '',
};
const FIELD_ORDER: RegistrationField[] = ['name', 'email', 'organization', 'questions', 'consent'];

export default function WebinarRegistrationForm({
  lang,
  eventSlug,
  turnstileSiteKey,
  privacyHref,
  copy,
}: Props) {
  const instanceId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const inFlightRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const [values, setValues] = useState<RegistrationValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const {
    containerRef: turnstileContainerRef,
    token: turnstileToken,
    unavailable: turnstileUnavailable,
    reset: resetTurnstile,
    announceRequired: announceTurnstileRequired,
    announceUnavailable: announceTurnstileUnavailable,
  } = useTurnstile({
    siteKey: turnstileSiteKey,
    action: 'webinar_register',
    language: lang,
    theme: 'light',
    size: 'normal',
    requiredMessage: copy.turnstileRequired,
    unavailableMessage: copy.turnstileUnavailable,
    setStatus,
  });

  const id = (field: string) => `registration-${field}-${instanceId}`;

  const fieldError = (field: RegistrationField): string => {
    if (field === 'questions') return copy.questionsError;
    return copy.validation[field];
  };

  const validate = (): RegistrationErrors => {
    const result = webinarRegistrationClientSchema.safeParse(values);
    if (result.success) return {};

    const nextErrors: RegistrationErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (typeof field === 'string' && FIELD_ORDER.includes(field as RegistrationField)) {
        const registrationField = field as RegistrationField;
        nextErrors[registrationField] ??= fieldError(registrationField);
      }
    }
    return nextErrors;
  };

  const validateField = (field: RegistrationField) => {
    const nextErrors = validate();
    setErrors((current) => ({ ...current, [field]: nextErrors[field] }));
  };

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    if (inFlightRef.current) return;

    const nextErrors = validate();
    setErrors(nextErrors);
    const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field]);
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    if (turnstileUnavailable) {
      announceTurnstileUnavailable();
      turnstileContainerRef.current?.focus();
      return;
    }
    if (!turnstileToken) {
      announceTurnstileRequired();
      turnstileContainerRef.current?.focus();
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    inFlightRef.current = true;
    setSubmitting(true);
    setStatus(copy.submitting);

    try {
      const response = await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...values, eventSlug, lang, turnstileToken }),
        signal: controller.signal,
      });
      let payload: unknown;
      try {
        payload = await response.json();
      } catch (error) {
        if (controller.signal.aborted) throw error;
        payload = null;
      }

      if (!mountedRef.current) return;
      if (response.ok && isFormResponse(payload) && payload.success) {
        setValues(EMPTY_VALUES);
        setErrors({});
        setStatus(copy.success);
        resetTurnstile();
        return;
      }

      if (isFormResponse(payload) && payload.code === 'RATE_LIMITED') {
        setStatus(copy.rateLimited);
      } else if (isFormResponse(payload) && payload.code === 'TURNSTILE_FAILED') {
        announceTurnstileRequired();
      } else {
        setStatus(copy.genericError);
      }
      resetTurnstile();
    } catch (error) {
      const isAbortError =
        controller.signal.aborted ||
        (typeof error === 'object' &&
          error !== null &&
          'name' in error &&
          error.name === 'AbortError');
      if (!isAbortError && mountedRef.current) {
        setStatus(copy.genericError);
        resetTurnstile();
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        inFlightRef.current = false;
        if (mountedRef.current) setSubmitting(false);
      }
    }
  };

  const inputClass = (field: RegistrationField) =>
    `min-h-11 w-full border bg-surface px-4 py-3 text-base text-ink focus:border-link ${errors[field] ? 'border-error' : 'border-border-strong'}`;

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate aria-label={copy.formLabel}>
      <p class="mb-6 text-sm text-muted">{copy.requiredNote}</p>

      <div class="grid gap-6 md:grid-cols-2">
        <div>
          <label class="mb-2 block text-sm font-semibold text-ink" for={id('name')}>
            {copy.nameLabel} <span class="text-muted">({copy.required})</span>
          </label>
          <input
            id={id('name')}
            name="name"
            type="text"
            required
            autoComplete="name"
            value={values.name}
            onInput={(event) => setValues({ ...values, name: event.currentTarget.value })}
            onBlur={() => validateField('name')}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? id('name-error') : undefined}
            class={inputClass('name')}
          />
          {errors.name && (
            <p id={id('name-error')} class="mt-2 text-sm text-error">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label class="mb-2 block text-sm font-semibold text-ink" for={id('email')}>
            {copy.emailLabel} <span class="text-muted">({copy.required})</span>
          </label>
          <input
            id={id('email')}
            name="email"
            type="email"
            required
            autoComplete="email"
            value={values.email}
            onInput={(event) => setValues({ ...values, email: event.currentTarget.value })}
            onBlur={() => validateField('email')}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? id('email-error') : undefined}
            class={inputClass('email')}
          />
          {errors.email && (
            <p id={id('email-error')} class="mt-2 text-sm text-error">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div class="mt-6">
        <label class="mb-2 block text-sm font-semibold text-ink" for={id('organization')}>
          {copy.organizationLabel} <span class="text-muted">({copy.optional})</span>
        </label>
        <input
          id={id('organization')}
          name="organization"
          type="text"
          autoComplete="organization"
          value={values.organization}
          onInput={(event) => setValues({ ...values, organization: event.currentTarget.value })}
          onBlur={() => validateField('organization')}
          aria-invalid={Boolean(errors.organization)}
          aria-describedby={errors.organization ? id('organization-error') : undefined}
          class={inputClass('organization')}
        />
        {errors.organization && (
          <p id={id('organization-error')} class="mt-2 text-sm text-error">
            {errors.organization}
          </p>
        )}
      </div>

      <div class="mt-6">
        <label class="mb-2 block text-sm font-semibold text-ink" for={id('questions')}>
          {copy.questionsLabel} <span class="text-muted">({copy.optional})</span>
        </label>
        <textarea
          id={id('questions')}
          name="questions"
          rows={5}
          value={values.questions}
          onInput={(event) => setValues({ ...values, questions: event.currentTarget.value })}
          onBlur={() => validateField('questions')}
          aria-invalid={Boolean(errors.questions)}
          aria-describedby={errors.questions ? id('questions-error') : undefined}
          class={inputClass('questions')}
        />
        {errors.questions && (
          <p id={id('questions-error')} class="mt-2 text-sm text-error">
            {errors.questions}
          </p>
        )}
      </div>

      <div class="fixed start-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label for={id('website')}>{copy.websiteLabel}</label>
        <input
          id={id('website')}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onInput={(event) => setValues({ ...values, website: event.currentTarget.value })}
        />
      </div>

      <div class="mt-6">
        <label class="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-6 text-text-body">
          <input
            id={id('consent')}
            name="consent"
            type="checkbox"
            required
            checked={values.consent}
            onChange={(event) => setValues({ ...values, consent: event.currentTarget.checked })}
            onBlur={() => validateField('consent')}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? id('consent-error') : undefined}
            class="mt-3 h-5 w-5 shrink-0 accent-link"
          />
          <span class="py-2.5">
            {copy.consentPrefix}{' '}
            <a class="text-link underline hover:text-link-hover" href={privacyHref}>
              {copy.consentLink}
            </a>{' '}
            {copy.consentSuffix} <span class="text-muted">({copy.required})</span>
          </span>
        </label>
        {errors.consent && (
          <p id={id('consent-error')} class="mt-2 text-sm text-error">
            {errors.consent}
          </p>
        )}
      </div>

      {/*
        The widget slot only reserves height while Turnstile is expected. When it is
        unavailable the reservation collapses, and the message is left to the live status
        region below the button — rendering it here as well duplicated the same sentence
        twice on screen.
      */}
      <div
        ref={turnstileContainerRef}
        class={
          turnstileUnavailable ? undefined : 'mt-6 h-[65px] w-[300px] max-w-full overflow-hidden'
        }
        tabIndex={turnstileUnavailable ? 0 : -1}
      />

      <button
        type="submit"
        disabled={submitting || turnstileUnavailable}
        class="mt-6 inline-flex min-h-11 w-full items-center justify-center bg-ink px-8 py-3 text-sm font-semibold uppercase tracking-button text-ink-inverse transition-colors duration-fast hover:bg-link disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting ? copy.submitting : copy.submit}
      </button>

      <p class="mt-4 min-h-6 text-sm text-text-body" role="status" aria-live="polite">
        {status}
      </p>
    </form>
  );
}
