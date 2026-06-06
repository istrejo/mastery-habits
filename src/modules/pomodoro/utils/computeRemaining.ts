export const computeRemaining = (
  startedAt: number | null,
  plannedDurationSeconds: number,
  pausedAccumMs: number,
  now: number = Date.now(),
): number => {
  if (startedAt === null) return plannedDurationSeconds;
  const elapsedMs = now - startedAt - pausedAccumMs;
  const elapsedSeconds = elapsedMs / 1000;
  return Math.max(0, plannedDurationSeconds - elapsedSeconds);
};
