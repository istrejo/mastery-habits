import { format } from 'date-fns';
import { supabase } from '@core/lib/supabase';
import { scoreService } from '@commitment/services/score.service';
import { useScoreStore } from '@commitment/states/score.store';
import type { Database } from '@shared/types/database.types';

type CheckInStatus = Database['public']['Enums']['checkin_status'];

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

  register: async (
    habitId: string,
    date: Date,
    status: CheckInStatus,
  ): Promise<{ score: number; level: string; used_skip: boolean }> => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const result = await scoreService.registerCheckIn(habitId, dateStr, status);
    useScoreStore.getState().setScore(habitId, result.score, result.level);
    return result;
  },
};
