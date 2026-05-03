import { startOfISOWeek, endOfISOWeek, format } from 'date-fns';
import { supabase } from '@core/lib/supabase';

export async function hasUsedSkipThisWeek(habitId: string, date: Date): Promise<boolean> {
  const weekStart = format(startOfISOWeek(date), 'yyyy-MM-dd');
  const weekEnd = format(endOfISOWeek(date), 'yyyy-MM-dd');

  const { data, error } = await supabase
    .from('check_ins')
    .select('id')
    .eq('habit_id', habitId)
    .eq('status', 'skipped')
    .gte('check_date', weekStart)
    .lte('check_date', weekEnd)
    .limit(1);

  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}
