import { useState, useEffect, useCallback } from 'react';
import { habitsService } from '../services/habits.service';
import { useHabitsStore } from '../states/habits.store';
import type { HabitInsert, HabitWithScore } from '../types';

export const useHabits = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { habits, setHabits, upsertHabit, removeHabit } = useHabitsStore();

  const fetchHabits = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await habitsService.listHabits();
    if (err) setError(err.message);
    else setHabits((data as unknown as HabitWithScore[]) ?? []);
    setLoading(false);
  }, [setHabits]);

  useEffect(() => {
    void fetchHabits();
  }, [fetchHabits]);

  const createHabit = async (data: HabitInsert): Promise<HabitWithScore | null> => {
    const { data: habit, error: err } = await habitsService.createHabit(data);
    if (err) { setError(err.message); return null; }
    const h = habit as unknown as HabitWithScore;
    upsertHabit(h);
    return h;
  };

  const archiveHabit = async (id: string) => {
    const { error: err } = await habitsService.archiveHabit(id);
    if (err) { setError(err.message); return; }
    removeHabit(id);
  };

  return { habits, loading, error, fetchHabits, createHabit, archiveHabit };
};
