const DEFAULT_RETRY_AFTER_MS = 5000;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export class RateLimitError extends ApiError {
  retryAfterMs: number;

  constructor(retryAfterMs = DEFAULT_RETRY_AFTER_MS) {
    super(
      "The Rick and Morty API is receiving too many requests. Please wait a moment before trying again.",
      429,
    );
    this.name = "RateLimitError";
    this.retryAfterMs = retryAfterMs;
  }
}

export function parseRetryAfter(header: string | null): number {
  if (!header) return DEFAULT_RETRY_AFTER_MS;

  const seconds = Number.parseInt(header, 10);
  if (!Number.isNaN(seconds)) return seconds * 1000;

  const retryDate = Date.parse(header);
  if (!Number.isNaN(retryDate)) return Math.max(0, retryDate - Date.now());

  return DEFAULT_RETRY_AFTER_MS;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
