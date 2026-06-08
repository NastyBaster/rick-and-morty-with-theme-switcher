const CACHE_TTL_MS = 30 * 60 * 1000;

interface ImageCacheEntry {
  blob: Blob;
  expiresAt: number;
}

const store = new Map<string, ImageCacheEntry>();

export function getCachedImage(url: string): Blob | null {
  const entry = store.get(url);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(url);
    return null;
  }
  return entry.blob;
}

export function setCachedImage(url: string, blob: Blob): void {
  store.set(url, { blob, expiresAt: Date.now() + CACHE_TTL_MS });
}
