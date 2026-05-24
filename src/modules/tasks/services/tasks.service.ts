import { supabase } from '@core/lib/supabase';
import { useSessionStore } from '@core/states/session.store';
import { format } from 'date-fns';
import type { Task, TaskInsert, TaskUpdate } from '../types';

const TASK_SELECT = '*, habits(id, name)';

export const tasksService = {
  async list(): Promise<Task[]> {
    const userId = useSessionStore.getState().user?.id;
    if (!userId) throw new Error('unauthenticated');

    const { data, error } = await supabase
      .from('tasks')
      .select(TASK_SELECT)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async listByHabit(habitId: string): Promise<Task[]> {
    const userId = useSessionStore.getState().user?.id;
    if (!userId) throw new Error('unauthenticated');

    const { data, error } = await supabase
      .from('tasks')
      .select(TASK_SELECT)
      .eq('user_id', userId)
      .eq('habit_id', habitId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async listToday(): Promise<Task[]> {
    const userId = useSessionStore.getState().user?.id;
    if (!userId) throw new Error('unauthenticated');

    const today = format(new Date(), 'yyyy-MM-dd');
    const { data, error } = await supabase
      .from('tasks')
      .select(TASK_SELECT)
      .eq('user_id', userId)
      .eq('due_date', today)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async create(input: Omit<TaskInsert, 'user_id'>): Promise<Task> {
    const userId = useSessionStore.getState().user?.id;
    if (!userId) throw new Error('unauthenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...input, user_id: userId })
      .select(TASK_SELECT)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async update(id: string, patch: TaskUpdate): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(patch)
      .eq('id', id)
      .select(TASK_SELECT)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async complete(id: string): Promise<Task> {
    return tasksService.update(id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  },

  async uncomplete(id: string): Promise<Task> {
    return tasksService.update(id, {
      status: 'pending',
      completed_at: null,
    });
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
