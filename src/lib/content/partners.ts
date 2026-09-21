import seedData from '@content/seed/partners.json';
import { publishedAssetPath, publishedExternalUrl } from '@lib/utils/media';
import type { Partner } from '@types';

export async function getPartners(category?: Partner['category']): Promise<Partner[]> {
  // Stage B: replace seedData with supabase.from('partners').select('*').eq('is_published', true).
  const partners = seedData as unknown as Partner[];

  return partners
    .filter((partner) => partner.isPublished && (!category || partner.category === category))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((partner) => ({
      ...partner,
      // Reserved seed paths/URLs are dropped so the card shows the partner wordmark instead of a
      // broken logo, and omits the website action instead of linking nowhere.
      logoPath: publishedAssetPath(partner.logoPath),
      websiteUrl: publishedExternalUrl(partner.websiteUrl),
    }));
}

export async function getPartnerById(id: string): Promise<Partner | undefined> {
  const partners = await getPartners();
  return partners.find((partner) => partner.id === id);
}
