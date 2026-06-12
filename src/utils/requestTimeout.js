const REQUEST_TIMEOUT_MS = 10000;

export function withTimeout(promise, timeoutMs = REQUEST_TIMEOUT_MS, timeoutMessage) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => {
        reject(new Error(timeoutMessage));
      }, timeoutMs);
    }),
  ]);
}
