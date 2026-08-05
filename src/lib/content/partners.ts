import seedData from '@content/seed/partners.json';
import type { Partner } from '@types';

export async function getPartners(category?: Partner['category']): Promise<Partner[]> {
  // Stage B: replace seedData with supabase.from('partners').select('*').eq('is_published', true).
  const partners = seedData as unknown as Partner[];

  return partners
    .filter((partner) => partner.isPublished && (!category || partner.category === category))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getPartnerById(id: string): Promise<Partner | undefined> {
  const partners = await getPartners();
  return partners.find((partner) => partner.id === id);
}
