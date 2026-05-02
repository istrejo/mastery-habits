import { supabase } from '@core/lib/supabase';
import { useSessionStore } from '@core/states/session.store';
import type { HabitInsert, HabitUpdate } from '../types';

const HABIT_SELECT = '*, mastery_scores(*)' as const;

export const habitsService = {
  listHabits: () =>
    supabase
      .from('habits')
      .select(HABIT_SELECT)
      .is('archived_at', null)
      .order('created_at', { ascending: true }),

  getHabit: (id: string) =>
    supabase
      .from('habits')
      .select(HABIT_SELECT)
      .eq('id', id)
      .single(),

  createHabit: (data: HabitInsert) => {
    const userId = useSessionStore.getState().user?.id ?? '';
    return supabase
      .from('habits')
      .insert({ ...data, user_id: userId })
      .select(HABIT_SELECT)
      .single();
  },

  updateHabit: (id: string, data: HabitUpdate) =>
    supabase
      .from('habits')
      .update(data)
      .eq('id', id)
      .select(HABIT_SELECT)
      .single(),

  archiveHabit: (id: string) =>
    supabase
      .from('habits')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id),
};
