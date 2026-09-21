import { getCollection, type CollectionEntry } from 'astro:content';
import { LANGUAGE_FALLBACKS } from '@constants';
import type { Language } from '@types';

export type AboutEntry = CollectionEntry<'about'>;

/**
 * Return the About document for `lang`.
 *
 * Mirrors `getPrinciples` / `getLegalEntries`. Markdown exists for French and English only;
 * without a fallback, Arabic and German prerendered `/about` to a zero-byte page because
 * `render(undefined)` was called on a missing entry. Add `about.ar.md` / `about.de.md` and
 * they are picked up automatically.
 */
export async function getAboutEntry(lang: Language): Promise<AboutEntry | undefined> {
  for (const candidate of [lang, ...LANGUAGE_FALLBACKS[lang]] as const) {
    const [entry] = await getCollection('about', ({ data }) => data.lang === candidate);

    if (entry) {
      return entry;
    }
  }

  return undefined;
}
