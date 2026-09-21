import seedData from '@content/seed/articles.json';
import type { Article, Language } from '@types';

/** Return published articles, newest first. Each record contains every translation. */
export async function getArticles(lang?: Language): Promise<Article[]> {
  // Stage B: replace seedData with supabase.from('articles').select('*').eq('status', 'published').
  void lang;
  const articles = seedData as unknown as Article[];

  return articles
    .filter((article) => article.status === 'published')
    .sort(
      (a, b) =>
        new Date(b.publishedAt ?? b.createdAt).getTime() -
        new Date(a.publishedAt ?? a.createdAt).getTime()
    );
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const articles = await getArticles();
  return articles.find((article) => article.slug === slug);
}
