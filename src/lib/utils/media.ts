import type { MediaAsset } from '@types';

function resolvePath(asset: MediaAsset, path: string): string {
  if (asset.storage !== 'r2') return path;

  const baseUrl = import.meta.env.PUBLIC_R2_BASE_URL?.trim().replace(/\/+$/, '');
  if (!baseUrl) return path;

  return `${baseUrl}/${path.replace(/^\/+/, '')}`;
}

export function resolveMediaUrl(asset: MediaAsset): string {
  return resolvePath(asset, asset.path);
}

export function resolvePosterUrl(asset: MediaAsset): string | undefined {
  return asset.posterPath ? resolvePath(asset, asset.posterPath) : undefined;
}

export function isVideoAsset(asset: MediaAsset): boolean {
  return asset.type === 'video' || /\.(?:mp4|webm|mov)$/i.test(resolveMediaUrl(asset));
}

export function getAlbums(assets: MediaAsset[]): string[] {
  const albums = new Set<string>();

  [...assets]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .forEach((asset) => {
      if (asset.album !== undefined) albums.add(asset.album);
    });

  return [...albums];
}
