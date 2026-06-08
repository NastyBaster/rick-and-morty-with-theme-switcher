import { API_BASE } from "./config";
import { getCached, setCached } from "./cache";
import { getCachedImage, setCachedImage } from "./imageCache";
import {
  enqueueRequest,
  getRateLimitCooldownMs,
  markRateLimited,
} from "./rateLimiter";

function resolveUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

function parseRetryAfter(header: string | null): number {
  if (!header) return 3000;
  const seconds = Number.parseInt(header, 10);
  return Number.isNaN(seconds) ? 3000 : seconds * 1000;
}

export class RateLimitError extends Error {
  retryAfterMs: number;

  constructor(retryAfterMs: number) {
    super("Too many requests. Please wait a moment and try again.");
    this.name = "RateLimitError";
    this.retryAfterMs = retryAfterMs;
  }
}

export async function fetchApi<T>(
  path: string,
  options: RequestInit & { skipCache?: boolean } = {},
): Promise<T> {
  const { skipCache = false, signal, ...fetchOptions } = options;
  const url = resolveUrl(path);
  const cacheKey = skipCache ? "" : url;

  if (cacheKey) {
    const cached = getCached<T>(cacheKey);
    if (cached) return cached;
  }

  const cooldown = getRateLimitCooldownMs();
  if (cooldown > 0) {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, cooldown);
      signal?.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          reject(new DOMException("Aborted", "AbortError"));
        },
        { once: true },
      );
    });
  }

  return enqueueRequest(async () => {
    const res = await fetch(url, { ...fetchOptions, signal });

    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    if (res.status === 429) {
      const retryAfterMs = parseRetryAfter(res.headers.get("Retry-After"));
      markRateLimited(retryAfterMs);
      throw new RateLimitError(retryAfterMs);
    }

    if (res.status === 404) {
      const data = (await res.json()) as T;
      if (cacheKey) setCached(cacheKey, data);
      return data;
    }

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    const data = (await res.json()) as T;
    if (cacheKey) setCached(cacheKey, data);
    return data;
  }, signal || undefined);
}

export async function fetchImageBlob(
  imageUrl: string,
  signal?: AbortSignal,
): Promise<Blob> {
  const cached = getCachedImage(imageUrl);
  if (cached) return cached;

  const cooldown = getRateLimitCooldownMs();
  if (cooldown > 0) {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, cooldown);
      signal?.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          reject(new DOMException("Aborted", "AbortError"));
        },
        { once: true },
      );
    });
  }

  return enqueueRequest(async () => {
    const res = await fetch(imageUrl, { signal });

    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    if (res.status === 429) {
      const retryAfterMs = parseRetryAfter(res.headers.get("Retry-After"));
      markRateLimited(retryAfterMs);
      throw new RateLimitError(retryAfterMs);
    }

    if (!res.ok) {
      throw new Error(`Image request failed with status ${res.status}`);
    }

    const blob = await res.blob();
    if (!blob.type.startsWith("image/")) {
      throw new Error("Response is not an image");
    }

    setCachedImage(imageUrl, blob);
    return blob;
  }, signal || undefined);
}
