export const isNetworkError = (error: unknown): boolean => {
  if (!error) return false;

  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  const networkErrorPatterns = [
    'network request failed',
    'network error',
    'failed to fetch',
    'fetch failed',
    'networkerror',
    'timeout',
    'connection',
    'unreachable',
    'offline',
    'no internet',
  ];

  return networkErrorPatterns.some((pattern) => errorMessage.includes(pattern));
};
