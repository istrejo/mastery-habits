export type CheckInStatus = 'completed' | 'skipped' | 'missed';

export interface ScoreResult {
  score: number;
  level: string;
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
