import { useMemo } from 'react';
import { getLevel, getLevelProgress } from '../utils/getLevel';
import type { Level } from '../types';

interface UseMasteryLevelResult {
  level: Level;
  progress: number;
}

export function useMasteryLevel(score: number): UseMasteryLevelResult {
  return useMemo(
    () => ({ level: getLevel(score), progress: getLevelProgress(score) }),
    [score],
  );
}
