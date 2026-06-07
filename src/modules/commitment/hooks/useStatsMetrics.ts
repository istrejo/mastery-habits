import { useEffect, useMemo, useReducer } from 'react';
import { useHabits } from '@habits/hooks/useHabits';
import { checkinService, type CheckInRecord } from '@checkin/services/checkin.service';
import { useSessionStore } from '@core/states/session.store';
import { deriveStatsMetrics, type StatsMetrics } from '../utils/statsMetrics';

const EMPTY_METRICS: StatsMetrics = {
  globalCurrentStreak: 0,
  globalBestStreak: 0,
  completion30d: { completed: 0, planned: 0, percent: 0 },
  completionCurrentWeek: { completed: 0, planned: 0, percent: 0 },
  completionPreviousWeek: { completed: 0, planned: 0, percent: 0 },
  completionDeltaVsPrevWeek: null,
  activity30dCells: [],
  topHabitsByCurrentStreak: [],
};

interface UseStatsMetricsResult extends StatsMetrics {
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

export function useStatsMetrics(): UseStatsMetricsResult {
  const { habits } = useHabits();
  const user = useSessionStore((state) => state.user);
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

  return useMemo(
    () => ({
      ...deriveStatsMetrics(habits, state.checkInsByHabit),
      loading: state.loading,
    }),
    [habits, state.checkInsByHabit, state.loading],
  );
}

const EMPTY_STATS_METRICS = EMPTY_METRICS;
