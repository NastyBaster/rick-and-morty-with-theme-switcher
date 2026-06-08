type QueueTask<T> = {
  run: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason: unknown) => void;
  signal?: AbortSignal;
};

const MIN_INTERVAL_MS = 600;
const RATE_LIMIT_COOLDOWN_MS = 5000;

let lastRequestAt = 0;
let rateLimitedUntil = 0;
let processing = false;
const queue: QueueTask<unknown>[] = [];

function isAborted(signal?: AbortSignal): boolean {
  return signal?.aborted ?? false;
}

async function waitForSlot(signal?: AbortSignal): Promise<void> {
  while (true) {
    if (isAborted(signal)) {
      throw new DOMException("Aborted", "AbortError");
    }

    const now = Date.now();
    const nextSlot = Math.max(
      lastRequestAt + MIN_INTERVAL_MS,
      rateLimitedUntil,
    );
    const delay = nextSlot - now;

    if (delay <= 0) return;

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, delay);
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
}

async function processQueue(): Promise<void> {
  if (processing) return;
  processing = true;

  while (queue.length > 0) {
    const task = queue[0];

    if (isAborted(task.signal)) {
      queue.shift();
      task.reject(new DOMException("Aborted", "AbortError"));
      continue;
    }

    try {
      await waitForSlot(task.signal);
      lastRequestAt = Date.now();
      const result = await task.run();
      queue.shift();
      task.resolve(result);
    } catch (err) {
      queue.shift();
      task.reject(err);
    }
  }

  processing = false;
}

export function markRateLimited(retryAfterMs = RATE_LIMIT_COOLDOWN_MS): void {
  rateLimitedUntil = Date.now() + retryAfterMs;
}

export function getRateLimitCooldownMs(): number {
  return Math.max(0, rateLimitedUntil - Date.now());
}

export function enqueueRequest<T>(
  run: () => Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  if (isAborted(signal)) {
    return Promise.reject(new DOMException("Aborted", "AbortError"));
  }

  return new Promise<T>((resolve, reject) => {
    queue.push({ run, resolve, reject, signal } as QueueTask<unknown>);
    void processQueue();
  });
}
