import { getCollection, type CollectionEntry } from 'astro:content';
import { LANGUAGE_FALLBACKS } from '@constants';
import type { Language } from '@types';

export type PrincipleEntry = CollectionEntry<'principles'>;

/**
 * Return the twelve principles for `lang`, ordered.
 *
 * Markdown entries exist for French and English. Locales that have no authored entries yet
 * (Arabic, German) fall back through `LANGUAGE_FALLBACKS` so their routes still render real
 * content instead of an empty grid. Drop `*.ar.md` / `*.de.md` files into
 * `src/content/principles` and they are picked up automatically.
 */
export async function getPrinciples(lang: Language): Promise<PrincipleEntry[]> {
  for (const candidate of [lang, ...LANGUAGE_FALLBACKS[lang]] as const) {
    const entries = await getCollection('principles', ({ data }) => data.lang === candidate);

    if (entries.length > 0) {
      return entries.sort((a, b) => a.data.order - b.data.order);
    }
  }

  return [];
}

/**
 * Editorial media assigned to each principle.
 *
 * The first eight files are the dedicated Kasbah3000 renders supplied with the project and
 * optimized to WebP for this site. The remaining four reuse the closest existing project media
 * rather than introducing generic stock photography. Cards treat these images as decorative
 * because the adjacent title and excerpt carry the link's accessible name; authored alt text is
 * preserved for detail-page hero imagery when it exists.
 */
const PRINCIPLE_MEDIA: Readonly<Record<string, string>> = {
  energy: '/media/principles/energy.webp',
  water: '/media/principles/water.webp',
  food: '/media/principles/food.webp',
  architecture: '/media/principles/architecture.webp',
  mobility: '/media/principles/mobility.webp',
  governance: '/media/principles/governance.webp',
  materials: '/media/site/earthen-home-entrance.jpg',
  waste: '/media/site/irrigation-gardens.jpg',
  biodiversity: '/media/principles/biodiversity.webp',
  community: '/media/principles/governance.webp',
  education: '/media/principles/education.webp',
  health: '/media/principles/mobility.webp',
};

export interface ResolvedPrincipleMedia {
  src: string;
  alt: string;
}

export function resolvePrincipleMedia(
  principle: Pick<PrincipleEntry['data'], 'slug' | 'image' | 'imageAlt'>
): ResolvedPrincipleMedia {
  return {
    src:
      PRINCIPLE_MEDIA[principle.slug] ?? principle.image ?? '/media/site/oasis-village-sunset.jpg',
    alt: principle.imageAlt ?? '',
  };
}
