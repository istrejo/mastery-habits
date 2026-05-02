import { supabase } from '@core/lib/supabase';
import type { Database } from '@shared/types/database.types';

type CheckInStatus = Database['public']['Enums']['checkin_status'];

export interface CheckInResult {
  score: number;
  level: string;
  used_skip: boolean;
}

export const scoreService = {
  registerCheckIn: async (
    habitId: string,
    checkDate: string,
    status: CheckInStatus,
  ): Promise<CheckInResult> => {
    const { data, error } = await supabase.rpc('register_check_in', {
      p_habit_id: habitId,
      p_check_date: checkDate,
      p_status: status,
    });

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error('no_result');

    const row = data[0];
    if (!row) throw new Error('no_result');

    return {
      score: row.score,
      level: row.level,
      used_skip: row.used_skip,
    };
  },
};
