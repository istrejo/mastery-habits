import type { Level } from '../types';
import { LEVELS } from './LEVELS';

export function getLevel(score: number): Level {
  const clamped = Math.max(0, Math.min(100, score));
  return LEVELS.find((l) => clamped <= l.max) ?? LEVELS[LEVELS.length - 1]!;
}

export function getLevelProgress(score: number): number {
  const level = getLevel(score);
  const range = level.max - level.min;
  if (range === 0) return 1;
  return Math.min(1, Math.max(0, (score - level.min) / range));
}
