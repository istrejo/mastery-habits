export type CheckInStatus = 'completed' | 'skipped' | 'missed';

export interface ScoreResult {
  score: number;
  level: string;
}

export interface MasteryScoreSnapshot {
  last_calculated_date: string | null;
  score: number;
}

export function calculateMasteryLevel(score: number): string {
  if (score <= 20) return 'seed';
  if (score <= 45) return 'sprout';
  if (score <= 70) return 'tree';
  if (score <= 90) return 'forest';
  return 'ancient';
}

export function calculateScore(
  prevScore: number,
  status: CheckInStatus,
  isPlannedDay: boolean,
): ScoreResult {
  let newScore: number;

  if (!isPlannedDay) {
    newScore = prevScore;
  } else {
    const compliance = status === 'completed' || status === 'skipped' ? 1 : 0;
    newScore = Math.round((prevScore * 0.8 + compliance * 20) * 100) / 100;
  }

  newScore = Math.max(0, Math.min(100, newScore));

  return { score: newScore, level: calculateMasteryLevel(newScore) };
}

/**
 * Picks the score to use as "previous score" when replaying/backfilling a check-in
 * for a given target date. Mirrors the SQL in register_check_in (migration 0012):
 * the most recent score whose last_calculated_date is strictly before targetDate.
 * If none, returns 0.
 */
export function pickPrevScore(
  history: readonly MasteryScoreSnapshot[],
  targetDate: string,
): number {
  const candidates = history
    .filter((s) => s.last_calculated_date !== null && s.last_calculated_date < targetDate)
    .sort((a, b) => (b.last_calculated_date ?? '').localeCompare(a.last_calculated_date ?? ''));

  return candidates[0]?.score ?? 0;
}
