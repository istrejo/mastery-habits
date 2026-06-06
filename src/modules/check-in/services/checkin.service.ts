import { format } from 'date-fns';
import { supabase } from '@core/lib/supabase';
import { scoreService } from '@commitment/services/score.service';
import { useScoreStore } from '@commitment/states/score.store';
import { calculateMasteryLevel, calculateScore } from '@commitment/utils/calculateScore';
import type { Habit } from '@habits/types';
import { isPlannedDay } from '../utils/isPlannedDay';
import type { Database } from '@shared/types/database.types';

type CheckInStatus = Database['public']['Enums']['checkin_status'];

export type CheckInErrorCode =
  | 'unauthenticated'
  | 'habit_not_found'
  | 'weekly_skip_already_used'
  | 'cannot_recover_missed_day'
  | 'checkin_too_old'
  | 'checkin_in_future'
  | 'unknown_error';

const KNOWN_CHECK_IN_CODES: ReadonlySet<string> = new Set<CheckInErrorCode>([
  'unauthenticated',
  'habit_not_found',
  'weekly_skip_already_used',
  'cannot_recover_missed_day',
  'checkin_too_old',
  'checkin_in_future',
]);

export class CheckInError extends Error {
  public readonly code: CheckInErrorCode;

  constructor(code: CheckInErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = 'CheckInError';
  }
}

function toCheckInError(err: unknown): CheckInError {
  if (err instanceof CheckInError) return err;
  const message = err instanceof Error ? err.message : 'unknown_error';
  const code = KNOWN_CHECK_IN_CODES.has(message) ? (message as CheckInErrorCode) : 'unknown_error';
  return new CheckInError(code);
}

export interface CheckInRecord {
  id: string;
  habit_id: string;
  check_date: string;
  status: CheckInStatus;
}

export const checkinService = {
  getCheckIn: async (habitId: string, date: Date): Promise<CheckInRecord | null> => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const { data, error } = await supabase
      .from('check_ins')
      .select('id, habit_id, check_date, status')
      .eq('habit_id', habitId)
      .eq('check_date', dateStr)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as CheckInRecord | null;
  },

  getLast30Days: async (habitId: string): Promise<CheckInRecord[]> => {
    const { data, error } = await supabase
      .from('check_ins')
      .select('id, habit_id, check_date, status')
      .eq('habit_id', habitId)
      .order('check_date', { ascending: false })
      .limit(30);

    if (error) throw new Error(error.message);
    return (data ?? []) as CheckInRecord[];
  },

  getAllForHabit: async (habitId: string): Promise<CheckInRecord[]> => {
    const { data, error } = await supabase
      .from('check_ins')
      .select('id, habit_id, check_date, status')
      .eq('habit_id', habitId)
      .order('check_date', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []) as CheckInRecord[];
  },

  getAllForHabits: async (habitIds: string[]): Promise<Record<string, CheckInRecord[]>> => {
    if (habitIds.length === 0) return {};

    const { data, error } = await supabase
      .from('check_ins')
      .select('id, habit_id, check_date, status')
      .in('habit_id', habitIds)
      .order('check_date', { ascending: true });

    if (error) throw new Error(error.message);

    const grouped = Object.fromEntries(
      habitIds.map((habitId) => [habitId, [] as CheckInRecord[]]),
    );

    for (const record of (data ?? []) as CheckInRecord[]) {
      grouped[record.habit_id]?.push(record);
    }

    return grouped;
  },

  getTodayForHabits: async (habitIds: string[], date: Date = new Date()): Promise<CheckInRecord[]> => {
    if (habitIds.length === 0) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    const { data, error } = await supabase
      .from('check_ins')
      .select('id, habit_id, check_date, status')
      .eq('check_date', dateStr)
      .in('habit_id', habitIds);

    if (error) throw new Error(error.message);
    return (data ?? []) as CheckInRecord[];
  },

  getRangeForHabits: async (
    habitIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<CheckInRecord[]> => {
    if (habitIds.length === 0) return [];

    const startStr = format(startDate, 'yyyy-MM-dd');
    const endStr = format(endDate, 'yyyy-MM-dd');
    const { data, error } = await supabase
      .from('check_ins')
      .select('id, habit_id, check_date, status')
      .in('habit_id', habitIds)
      .gte('check_date', startStr)
      .lte('check_date', endStr)
      .order('check_date', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []) as CheckInRecord[];
  },

  register: async (
    habitId: string,
    date: Date,
    status: CheckInStatus,
  ): Promise<{ score: number; level: string; used_skip: boolean }> => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const result = await scoreService
      .registerCheckIn(habitId, dateStr, status)
      .catch((err: unknown) => {
        throw toCheckInError(err);
      });
    useScoreStore.getState().setScore(habitId, result.score, result.level);
    return result;
  },

  undo: async (
    habit: Pick<Habit, 'id' | 'user_id' | 'frequency_days'>,
    date: Date,
  ): Promise<{ score: number; level: string }> => {
    const dateStr = format(date, 'yyyy-MM-dd');

    const { error: deleteError } = await supabase
      .from('check_ins')
      .delete()
      .eq('habit_id', habit.id)
      .eq('check_date', dateStr);

    if (deleteError) throw new Error(deleteError.message);

    const remaining = await checkinService.getAllForHabit(habit.id);

    let score = 0;
    let level = calculateMasteryLevel(0);
    let lastCalculatedDate: string | null = null;

    for (const record of remaining) {
      const result = calculateScore(
        score,
        record.status,
        isPlannedDay(habit, new Date(`${record.check_date}T12:00:00`)),
      );
      score = result.score;
      level = result.level;
      lastCalculatedDate = record.check_date;
    }

    const { error: upsertError } = await supabase
      .from('mastery_scores')
      .upsert({
        habit_id: habit.id,
        user_id: habit.user_id,
        score,
        level,
        last_calculated_date: lastCalculatedDate,
      });

    if (upsertError) throw new Error(upsertError.message);

    useScoreStore.getState().setScore(habit.id, score, level);
    return { score, level };
  },
};
