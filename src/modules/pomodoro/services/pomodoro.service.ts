import { supabase } from '@core/lib/supabase';
import { useSessionStore } from '@core/states/session.store';
import type { PomodoroSession, PomodoroSessionInsert } from '../types';

export const pomodoroService = {
  async recordSession(input: Omit<PomodoroSessionInsert, 'user_id'>): Promise<PomodoroSession> {
    const userId = useSessionStore.getState().user?.id;
    if (!userId) throw new Error('unauthenticated');

    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .insert({ ...input, user_id: userId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async listRecent(limit = 20): Promise<PomodoroSession[]> {
    const userId = useSessionStore.getState().user?.id;
    if (!userId) throw new Error('unauthenticated');

    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .select()
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async listForHabit(habitId: string): Promise<PomodoroSession[]> {
    const userId = useSessionStore.getState().user?.id;
    if (!userId) throw new Error('unauthenticated');

    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .select()
      .eq('user_id', userId)
      .eq('habit_id', habitId)
      .order('started_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async listForTask(taskId: string): Promise<PomodoroSession[]> {
    const userId = useSessionStore.getState().user?.id;
    if (!userId) throw new Error('unauthenticated');

    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .select()
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .order('started_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  },
};
