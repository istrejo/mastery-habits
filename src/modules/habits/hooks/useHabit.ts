import { useState, useEffect } from 'react';
import { habitsService } from '../services/habits.service';
import { useHabitsStore } from '../states/habits.store';
import type { HabitUpdate, HabitWithScore } from '../types';

export const useHabit = (id: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { habits, upsertHabit } = useHabitsStore();
  const habit = habits.find((h) => h.id === id) ?? null;

  useEffect(() => {
    if (habit) return;
    setLoading(true);
    habitsService.getHabit(id).then(({ data, error: err }) => {
      if (err) setError(err.message);
      else if (data) upsertHabit(data as unknown as HabitWithScore);
      setLoading(false);
    });
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateHabit = async (data: HabitUpdate): Promise<HabitWithScore | null> => {
    const { data: updated, error: err } = await habitsService.updateHabit(id, data);
    if (err) { setError(err.message); return null; }
    const h = updated as unknown as HabitWithScore;
    upsertHabit(h);
    return h;
  };

  return { habit, loading, error, updateHabit };
};
