import { getCollection, type CollectionEntry } from 'astro:content';
import { LANGUAGE_FALLBACKS } from '@constants';
import type { Language } from '@types';

export type LegalEntry = CollectionEntry<'legal'>;

/**
 * Return the legal documents for `lang`.
 *
 * Mirrors `getPrinciples`: Arabic and German have no authored legal Markdown yet, so they
 * fall back to English/French rather than producing missing routes for the footer links.
 */
export async function getLegalEntries(lang: Language): Promise<LegalEntry[]> {
  for (const candidate of [lang, ...LANGUAGE_FALLBACKS[lang]] as const) {
    const entries = await getCollection('legal', ({ data }) => data.lang === candidate);

    if (entries.length > 0) {
      return entries;
    }
  }

  return [];
}
