import { LOCALE_CODES } from '@constants';
import { localize, t, type TranslationKey } from '@lib/utils/i18n';
import type { EventItem, EventType, Language, RegistrationStatus } from '@types';

/** BCP 47 tag for `Intl` from the stored Open Graph style code (fr_FR -> fr-FR). */
function intlLocale(lang: Language): string {
  return LOCALE_CODES[lang].replace('_', '-');
}

const TYPE_KEYS: Record<EventType, TranslationKey> = {
  webinar: 'events.type.webinar' as TranslationKey,
  workshop: 'events.type.workshop' as TranslationKey,
  visit: 'events.type.visit' as TranslationKey,
  conference: 'events.type.conference' as TranslationKey,
};

const STATUS_KEYS: Record<RegistrationStatus, TranslationKey> = {
  announced: 'events.status.announced' as TranslationKey,
  open: 'events.status.open' as TranslationKey,
  closed: 'events.status.closed' as TranslationKey,
  full: 'events.status.full' as TranslationKey,
};

export function getEventTypeLabel(type: EventType, lang: Language): string {
  return t(lang, TYPE_KEYS[type]);
}

export function getRegistrationStatusLabel(status: RegistrationStatus, lang: Language): string {
  return t(lang, STATUS_KEYS[status]);
}

/** Localised date, or the "to be announced" string when no date is set. */
export function formatEventDate(event: EventItem, lang: Language): string {
  if (!event.startsAt) return t(lang, 'events.date.tba' as TranslationKey);

  return new Intl.DateTimeFormat(intlLocale(lang), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: event.timezone ?? 'UTC',
  }).format(new Date(event.startsAt));
}

/** Localised start time including timezone, or the "to be announced" string. */
export function formatEventTime(event: EventItem, lang: Language): string {
  if (!event.startsAt) return t(lang, 'events.time.tba' as TranslationKey);

  return new Intl.DateTimeFormat(intlLocale(lang), {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
    timeZone: event.timezone ?? 'UTC',
  }).format(new Date(event.startsAt));
}

/** Duration rendered with the locale's unit formatting, or undefined when not announced. */
export function formatEventDuration(event: EventItem, lang: Language): string | undefined {
  if (event.durationMinutes === null) return undefined;

  return new Intl.NumberFormat(intlLocale(lang), {
    style: 'unit',
    unit: 'minute',
    unitDisplay: 'long',
  }).format(event.durationMinutes);
}

export function formatEventLocation(event: EventItem, lang: Language): string | undefined {
  return event.location ? localize(event.location, lang) : undefined;
}

/** `datetime` attribute for <time>, omitted when there is no announced date. */
export function eventDateTimeAttribute(event: EventItem): string | undefined {
  return event.startsAt ?? undefined;
}
