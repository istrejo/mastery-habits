/**
 * Races a promise against a timeout. If the promise does not settle within
 * `ms` milliseconds, the returned promise rejects with an Error whose
 * `.code` is `${label}_timeout`.
 *
 * Use this for any user-facing async API that might hang indefinitely
 * (e.g. in-app browsers, native auth dialogs, network calls without their
 * own timeout).
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`${label}_timeout`) as Error & { code?: string };
      err.code = `${label}_timeout`;
      reject(err);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer !== null) clearTimeout(timer);
  });
}
