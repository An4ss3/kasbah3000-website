import seedData from '@content/seed/gallery.json';
import type { MediaAsset } from '@types';

export async function getGallery(type?: MediaAsset['type']): Promise<MediaAsset[]> {
  // Stage B: replace seedData with supabase.from('media_assets').select('*').eq('is_published', true).
  const assets = seedData as unknown as MediaAsset[];

  return assets
    .filter((asset) => asset.isPublished && (!type || asset.type === type))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export const getGalleryAssets = getGallery;

export async function getMediaAssetById(id: string): Promise<MediaAsset | undefined> {
  const assets = await getGallery();
  return assets.find((asset) => asset.id === id);
}
