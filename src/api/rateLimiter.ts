type QueueTask<T> = {
  run: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason: unknown) => void;
  signal?: AbortSignal;
};

const MIN_INTERVAL_MS = 250;
const DEFAULT_RATE_LIMIT_COOLDOWN_MS = 5000;

let lastRequestAt = 0;
let rateLimitedUntil = 0;
let processing = false;
const queue: QueueTask<unknown>[] = [];

function abortError(): DOMException {
  return new DOMException("Aborted", "AbortError");
}

function isAborted(signal?: AbortSignal): boolean {
  return signal?.aborted ?? false;
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  if (isAborted(signal)) return Promise.reject(abortError());

  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timer);
        reject(abortError());
      },
      { once: true },
    );
  });
}

async function waitForSlot(signal?: AbortSignal): Promise<void> {
  const now = Date.now();
  const nextSlot = Math.max(
    lastRequestAt + MIN_INTERVAL_MS,
    rateLimitedUntil,
  );
  await wait(nextSlot - now, signal);
}

async function processQueue(): Promise<void> {
  if (processing) return;
  processing = true;

  while (queue.length > 0) {
    const task = queue.shift();
    if (!task) continue;

    if (isAborted(task.signal)) {
      task.reject(abortError());
      continue;
    }

    try {
      await waitForSlot(task.signal);
      lastRequestAt = Date.now();
      task.resolve(await task.run());
    } catch (error) {
      task.reject(error);
    }
  }

  processing = false;
}

export function markRateLimited(
  retryAfterMs = DEFAULT_RATE_LIMIT_COOLDOWN_MS,
): void {
  rateLimitedUntil = Math.max(rateLimitedUntil, Date.now() + retryAfterMs);
}

export function getRateLimitCooldownMs(): number {
  return Math.max(0, rateLimitedUntil - Date.now());
}

export function enqueueRequest<T>(
  run: () => Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  if (isAborted(signal)) return Promise.reject(abortError());

  return new Promise<T>((resolve, reject) => {
    queue.push({ run, resolve, reject, signal } as QueueTask<unknown>);
    void processQueue();
  });
}
