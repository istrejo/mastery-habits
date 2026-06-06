import { useEffect, useMemo, useState } from 'react';
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

export function useStatsMetrics(): UseStatsMetricsResult {
  const { habits } = useHabits();
  const user = useSessionStore((state) => state.user);
  const [checkInsByHabit, setCheckInsByHabit] = useState<Record<string, CheckInRecord[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || habits.length === 0) {
      setCheckInsByHabit({});
      return;
    }

    let cancelled = false;
    setLoading(true);

    checkinService
      .getAllForHabits(habits.map((habit) => habit.id))
      .then((records) => {
        if (cancelled) return;
        setCheckInsByHabit(records);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [habits, user]);

  return useMemo(
    () => ({
      ...deriveStatsMetrics(habits, checkInsByHabit),
      loading,
    }),
    [habits, checkInsByHabit, loading],
  );
}

export const EMPTY_STATS_METRICS = EMPTY_METRICS;
