import { useCallback, useState } from 'react';
import { scoreService } from '../services/score.service';
import { useScoreStore } from '../states/score.store';
import type { Database } from '@shared/types/database.types';

type CheckInStatus = Database['public']['Enums']['checkin_status'];

interface UseCommitmentScoreResult {
  loading: boolean;
  error: string | null;
  registerCheckIn: (
    habitId: string,
    checkDate: string,
    status: CheckInStatus,
  ) => Promise<{ score: number; level: string; used_skip: boolean } | null>;
  getScore: (habitId: string) => { score: number; level: string } | null;
}

export function useCommitmentScore(): UseCommitmentScoreResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { scores, setScore } = useScoreStore();

  const registerCheckIn = useCallback(
    async (habitId: string, checkDate: string, status: CheckInStatus) => {
      setLoading(true);
      setError(null);
      try {
        const result = await scoreService.registerCheckIn(habitId, checkDate, status);
        setScore(habitId, result.score, result.level);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown_error';
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setScore],
  );

  const getScore = useCallback(
    (habitId: string) => scores[habitId] ?? null,
    [scores],
  );

  return { loading, error, registerCheckIn, getScore };
}
