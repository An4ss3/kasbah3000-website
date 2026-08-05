import { getArticles } from '@lib/content/articles';
import { t, type TranslationKey } from '@lib/utils/i18n';
import type { Language } from '@types';

/** Distinct article categories present in the data, in first-seen order. */
export async function getArticleCategories(): Promise<string[]> {
  const articles = await getArticles();
  const categories: string[] = [];

  for (const article of articles) {
    if (article.category && !categories.includes(article.category)) {
      categories.push(article.category);
    }
  }

  return categories;
}

const CATEGORY_KEYS: Record<string, TranslationKey> = {
  community: 'article.category.community',
  water: 'article.category.water',
  project: 'article.category.project',
};

/** Localized label for a seed article category, sourced from `article.category.*` i18n keys. */
export function getArticleCategoryLabel(
  category: string | undefined,
  lang: Language
): string | undefined {
  if (!category) return undefined;

  const key = CATEGORY_KEYS[category];
  return key ? t(lang, key) : category;
}
