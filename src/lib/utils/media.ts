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

/*
 * Seed data carries reserved paths and profile URLs for assets that have not been supplied yet:
 * `/placeholder/team/othman.jpg`, `https://www.linkedin.com/in/placeholder-othman`. Nothing exists
 * behind them, so rendering them produced broken images and dead outbound links on the Team and
 * Partners pages. Treating them as absent lets the components fall back to their typographic
 * treatment instead, and makes real assets a drop-in replacement with no code change.
 */
const PLACEHOLDER_ASSET_PREFIX = '/placeholder/';
const PLACEHOLDER_URL_MARKER = 'placeholder-';

/** Returns the path only when it points at a real, shipped asset. */
export function publishedAssetPath(path?: string): string | undefined {
  const value = path?.trim();
  if (!value || value.startsWith(PLACEHOLDER_ASSET_PREFIX)) return undefined;
  return value;
}

/** Returns the URL only when it is a real destination rather than a reserved stand-in. */
export function publishedExternalUrl(url?: string): string | undefined {
  const value = url?.trim();
  if (!value || value.includes(PLACEHOLDER_URL_MARKER)) return undefined;
  return value;
}
