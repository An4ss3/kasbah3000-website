import en from '../../i18n/en.json';
import fr from '../../i18n/fr.json';
import { SITE } from '@constants';
import type { Language } from '@types';

const translations: Record<Language, typeof fr> = { fr, en };
const LOCALE_PREFIX = /^\/(?:fr|en)(?=\/|$)/;

export type TranslationKey = keyof typeof fr;

export function t(lang: Language, key: TranslationKey): string {
  return translations[lang][key];
}

export function isLanguage(value: string | undefined): value is Language {
  return SITE.languages.some((language) => language === value);
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
