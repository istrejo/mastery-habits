import type { Database } from '@shared/types/database.types';

export type Habit = Database['public']['Tables']['habits']['Row'];
export type Score = Database['public']['Tables']['mastery_scores']['Row'];
export type HabitWithScore = Habit & { mastery_scores: Score | null };

export type HabitInsert = Pick<Habit, 'name' | 'frequency_days'> &
  Partial<Pick<Habit, 'description' | 'category'>>;

export type HabitUpdate = Partial<HabitInsert>;
