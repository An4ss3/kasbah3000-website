import seedData from '@content/seed/faqs.json';
import type { FAQ } from '@types';

export async function getFAQs(): Promise<FAQ[]> {
  // Stage B: replace seedData with supabase.from('faqs').select('*').eq('is_published', true).
  const faqs = seedData as unknown as FAQ[];

  return faqs.filter((faq) => faq.isPublished).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getFAQById(id: string): Promise<FAQ | undefined> {
  const faqs = await getFAQs();
  return faqs.find((faq) => faq.id === id);
}
