import { useEffect, useRef, useReducer } from 'react';
import { habitsService } from '../services/habits.service';
import { useHabitsStore } from '../states/habits.store';
import type { HabitUpdate, HabitWithScore } from '../types';

type LoadState = { loading: boolean; error: string | null };

const loadReducer = (
  _state: LoadState,
  action: LoadState,
): LoadState => action;

export const useHabit = (id: string) => {
  const [loadState, dispatch] = useReducer(loadReducer, {
    loading: false,
    error: null,
  });
  const { habits, upsertHabit } = useHabitsStore();
  const habit = habits.find((h) => h.id === id) ?? null;

  const prevIdRef = useRef(id);
  const prevHabitRef = useRef(habit);

  if (id !== prevIdRef.current || habit !== prevHabitRef.current) {
    prevIdRef.current = id;
    prevHabitRef.current = habit;
    if (!habit) {
      dispatch({ loading: true, error: null });
    } else {
      dispatch({ loading: false, error: null });
    }
  }

  useEffect(() => {
    if (habit) return;
    habitsService.getHabit(id).then(({ data, error: err }) => {
      if (err) dispatch({ loading: false, error: err.message });
      else if (data) {
        upsertHabit(data as unknown as HabitWithScore);
        dispatch({ loading: false, error: null });
      }
    });
  }, [id, habit, upsertHabit]);

  const updateHabit = async (data: HabitUpdate): Promise<HabitWithScore | null> => {
    const { data: updated, error: err } = await habitsService.updateHabit(id, data);
    if (err) { dispatch({ loading: false, error: err.message }); return null; }
    const h = updated as unknown as HabitWithScore;
    upsertHabit(h);
    return h;
  };

  return { habit, loading: loadState.loading, error: loadState.error, updateHabit };
};
