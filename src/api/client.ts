import { API_BASE } from "./config";
import { getCached, setCached } from "./cache";
import { ApiError, RateLimitError, parseRetryAfter } from "./errors";
import { enqueueRequest, markRateLimited } from "./rateLimiter";

function resolveUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return undefined as T;
  return (await response.json()) as T;
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

  return enqueueRequest(async () => {
    const response = await fetch(url, { ...fetchOptions, signal });

    if (response.status === 429) {
      const retryAfterMs = parseRetryAfter(
        response.headers.get("Retry-After"),
      );
      markRateLimited(retryAfterMs);
      throw new RateLimitError(retryAfterMs);
    }

    const data = await parseResponse<T>(response);

    if (!response.ok && response.status !== 404) {
      throw new ApiError(
        `Request failed with status ${response.status}`,
        response.status,
      );
    }

    if (cacheKey) setCached(cacheKey, data);
    return data;
  }, signal ?? undefined);
}

export { ApiError, RateLimitError } from "./errors";
