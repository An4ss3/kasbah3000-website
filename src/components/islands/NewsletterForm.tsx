import { useEffect, useId, useRef, useState } from 'preact/hooks';
import type { NewsletterFormCopy } from '@lib/forms/copy';
import { isFormResponse, newsletterClientSchema } from '@lib/forms/schemas';
import { useTurnstile } from '@lib/forms/use-turnstile';
import type { Language } from '@types';

interface Props {
  lang: Language;
  turnstileSiteKey: string;
  privacyHref: string;
  placement: 'home' | 'footer';
  copy: NewsletterFormCopy;
}

type NewsletterField = 'email' | 'consent';
type NewsletterErrors = Partial<Record<NewsletterField, string>>;

interface NewsletterValues {
  email: string;
  consent: boolean;
  website: string;
}

const EMPTY_VALUES: NewsletterValues = { email: '', consent: false, website: '' };

export default function NewsletterForm({
  lang,
  turnstileSiteKey,
  privacyHref,
  placement,
  copy,
}: Props) {
  const instanceId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const inFlightRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const [values, setValues] = useState<NewsletterValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<NewsletterErrors>({});
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isDark = placement === 'home' || placement === 'footer';

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
    action: 'newsletter_subscribe',
    language: lang,
    theme: isDark ? 'dark' : 'light',
    size: placement === 'footer' ? 'compact' : 'normal',
    requiredMessage: copy.turnstileRequired,
    unavailableMessage: copy.turnstileUnavailable,
    setStatus,
  });
  const id = (field: string) => `${placement}-newsletter-${field}-${instanceId}`;

  const validate = (): NewsletterErrors => {
    const result = newsletterClientSchema.safeParse(values);
    if (result.success) return {};

    const nextErrors: NewsletterErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (field === 'email' || field === 'consent') {
        nextErrors[field] ??= copy.validation[field];
      }
    }
    return nextErrors;
  };

  const validateField = (field: NewsletterField) => {
    const nextErrors = validate();
    setErrors((current) => ({ ...current, [field]: nextErrors[field] }));
  };

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    if (inFlightRef.current) return;

    const nextErrors = validate();
    setErrors(nextErrors);
    if (nextErrors.email) {
      formRef.current?.querySelector<HTMLElement>('[name="email"]')?.focus();
      return;
    }
    if (nextErrors.consent) {
      formRef.current?.querySelector<HTMLElement>('[name="consent"]')?.focus();
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
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...values, lang, turnstileToken }),
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

  const labelClass = isDark ? 'text-ink-inverse' : 'text-ink';
  const bodyClass = isDark ? 'text-text-body-dark' : 'text-text-body';
  const inputClass = isDark
    ? 'border-border-dark bg-transparent text-ink-inverse placeholder:text-muted-faint focus:border-accent-on-dark'
    : 'border-border-strong bg-surface text-ink placeholder:text-muted focus:border-link';
  const buttonClass = isDark
    ? 'bg-background text-ink hover:bg-surface'
    : 'bg-ink text-ink-inverse hover:bg-link';

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-label={copy.formLabel}
      class={placement === 'home' ? 'max-w-prose' : ''}
    >
      <div class={placement === 'home' ? 'grid gap-3 sm:grid-cols-[1fr_auto]' : 'grid gap-3'}>
        <div>
          <label class={`mb-2 block text-sm font-semibold ${labelClass}`} for={id('email')}>
            {copy.emailLabel} <span class={bodyClass}>({copy.required})</span>
          </label>
          <input
            id={id('email')}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={copy.emailPlaceholder}
            value={values.email}
            onInput={(event) => setValues({ ...values, email: event.currentTarget.value })}
            onBlur={() => validateField('email')}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? id('email-error') : undefined}
            class={`min-h-11 w-full border px-4 py-3 text-sm ${inputClass} ${errors.email ? 'border-error' : ''}`}
          />
          {errors.email && (
            <p id={id('email-error')} class="mt-2 text-sm text-error">
              {errors.email}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || turnstileUnavailable}
          class={`min-h-11 px-6 py-3 text-sm font-semibold uppercase tracking-button transition-colors duration-fast disabled:cursor-not-allowed disabled:opacity-60 ${placement === 'home' ? 'sm:mt-7' : ''} ${buttonClass}`}
        >
          {submitting ? copy.submitting : copy.submit}
        </button>
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

      <label
        class={`mt-4 flex min-h-11 cursor-pointer items-start gap-3 text-xs leading-6 ${bodyClass}`}
      >
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
          <a
            class={
              isDark ? 'text-accent-on-dark underline' : 'text-link underline hover:text-link-hover'
            }
            href={privacyHref}
          >
            {copy.consentLink}
          </a>{' '}
          {copy.consentSuffix} <span>({copy.required})</span>
        </span>
      </label>
      {errors.consent && (
        <p id={id('consent-error')} class="mt-2 text-sm text-error">
          {errors.consent}
        </p>
      )}

      <div
        ref={turnstileContainerRef}
        class={`mt-4 w-full max-w-full ${placement === 'footer' ? 'min-h-[140px]' : 'min-h-[65px]'}`}
        tabIndex={turnstileUnavailable ? 0 : -1}
      />
      {turnstileUnavailable && <p class="mt-2 text-sm text-error">{copy.turnstileUnavailable}</p>}

      <p class={`mt-3 min-h-6 text-sm ${bodyClass}`} role="status" aria-live="polite">
        {status}
      </p>
    </form>
  );
}
