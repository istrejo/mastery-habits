import { getISODay } from 'date-fns';
import type { Habit } from '@habits/types';

export function isPlannedDay(habit: Pick<Habit, 'frequency_days'>, date: Date): boolean {
  const dow = getISODay(date) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  return (habit.frequency_days as number[]).includes(dow);
}
