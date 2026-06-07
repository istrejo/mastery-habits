import { useEffect, useMemo, useReducer } from 'react';
import { useHabits } from '@habits/hooks/useHabits';
import { checkinService } from '@checkin/services/checkin.service';
import { useSessionStore } from '@core/states/session.store';
import { calculateStreak } from '../utils/calculateStreak';
import type { CheckInRecord } from '@checkin/services/checkin.service';

interface UseGlobalStreakResult {
  current: number;
  best: number;
  loading: boolean;
}

type State = {
  checkInsByHabit: Record<string, CheckInRecord[]>;
  loading: boolean;
};

type Action =
  | { type: 'reset' }
  | { type: 'fetch_start' }
  | { type: 'fetch_success'; records: Record<string, CheckInRecord[]> }
  | { type: 'fetch_end' };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'reset':
      return { checkInsByHabit: {}, loading: false };
    case 'fetch_start':
      return { ...state, loading: true };
    case 'fetch_success':
      return { checkInsByHabit: action.records, loading: state.loading };
    case 'fetch_end':
      return { ...state, loading: false };
    default:
      return state;
  }
};

export function useGlobalStreak(): UseGlobalStreakResult {
  const { habits } = useHabits();
  const user = useSessionStore((s) => s.user);
  const [state, dispatch] = useReducer(reducer, {
    checkInsByHabit: {},
    loading: false,
  });

  useEffect(() => {
    if (!user || habits.length === 0) {
      dispatch({ type: 'reset' });
      return;
    }

    let cancelled = false;
    dispatch({ type: 'fetch_start' });

    checkinService
      .getAllForHabits(habits.map((habit) => habit.id))
      .then((records) => {
        if (cancelled) return;
        dispatch({ type: 'fetch_success', records });
      })
      .finally(() => {
        if (!cancelled) dispatch({ type: 'fetch_end' });
      });

    return () => {
      cancelled = true;
    };
  }, [habits, user]);

  return useMemo(() => {
    if (habits.length === 0) return { current: 0, best: 0, loading: state.loading };

    const perHabit = habits.map((h) =>
      calculateStreak(h, state.checkInsByHabit[h.id] ?? []),
    );

    const current = Math.min(...perHabit.map((s) => s.current));
    const best = Math.max(...perHabit.map((s) => s.best));

    return { current, best, loading: state.loading };
  }, [habits, state.checkInsByHabit, state.loading]);
}
