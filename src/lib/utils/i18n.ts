import ar from '../../i18n/ar.json';
import de from '../../i18n/de.json';
import en from '../../i18n/en.json';
import fr from '../../i18n/fr.json';
import { LANGUAGE_FALLBACKS, RTL_LANGUAGES, SITE } from '@constants';
import type { Direction, Language, LocalizedString } from '@types';

/** French is the authoring source, so its key set defines the contract. */
type TranslationTable = typeof fr;

const translations: Record<Language, Partial<TranslationTable>> = { fr, en, ar, de };

const LOCALE_PREFIX = new RegExp(`^/(?:${SITE.languages.join('|')})(?=/|$)`);

export type TranslationKey = keyof TranslationTable;

/**
 * Resolve a UI string for `lang`.
 *
 * Arabic and German are translated but may lag behind FR/EN as copy evolves, so a missing
 * or empty value walks the fallback chain (ar/de -> en -> fr) instead of rendering
 * `undefined`. The key itself is returned only if no locale supplies a value.
 */
export function t(lang: Language, key: TranslationKey): string {
  const candidates: readonly Language[] = [lang, ...LANGUAGE_FALLBACKS[lang]];

  for (const candidate of candidates) {
    const value = translations[candidate]?.[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  return key;
}

/**
 * Resolve a localized content value (seed data, navigation labels, GeoJSON properties).
 * Follows the same fallback chain as `t()`.
 */
export function localize(value: LocalizedString, lang: Language): string {
  const candidates: readonly Language[] = [lang, ...LANGUAGE_FALLBACKS[lang]];

  for (const candidate of candidates) {
    const translated = value[candidate];
    if (typeof translated === 'string' && translated.length > 0) {
      return translated;
    }
  }

  return '';
}

export function isLanguage(value: string | undefined): value is Language {
  return SITE.languages.some((language) => language === value);
}

/** Writing direction for a locale. */
export function getDirection(lang: Language): Direction {
  return RTL_LANGUAGES.some((language) => language === lang) ? 'rtl' : 'ltr';
}

export function isRtl(lang: Language): boolean {
  return getDirection(lang) === 'rtl';
}

export function getLanguageFromPath(pathname: string): Language {
  const locale = pathname.split('/').filter(Boolean)[0];
  return isLanguage(locale) ? locale : SITE.defaultLanguage;
}

export function stripLocalePrefix(pathname: string): string {
  const path = pathname.replace(LOCALE_PREFIX, '');
  return path === '' ? '/' : path;
}

export function getLocalizedPath(pathname: string, lang: Language): string {
  const path = stripLocalePrefix(pathname);

  if (lang === SITE.defaultLanguage) {
    return path;
  }

  return path === '/' ? `/${lang}/` : `/${lang}${path}`;
}

export function isPathActive(currentPath: string, href: string, lang: Language): boolean {
  const localizedHref = getLocalizedPath(href, lang);
  const current = currentPath.replace(/\/$/, '') || '/';
  const target = localizedHref.replace(/\/$/, '') || '/';

  return target === '/'
    ? current === target
    : current === target || current.startsWith(`${target}/`);
}
