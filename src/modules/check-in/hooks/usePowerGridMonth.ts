import { useCallback, useEffect, useMemo, useState } from 'react';
import { addDays, endOfDay, format, startOfDay, subDays } from 'date-fns';
import { useHabits } from '@habits/hooks/useHabits';
import { useGlobalStreak } from '@commitment/hooks/useGlobalStreak';
import { checkinService, type CheckInRecord } from '../services/checkin.service';
import {
  buildPowerGridWindow,
  type PowerGridDayCell,
} from '../utils/buildPowerGridMonth';

interface UsePowerGridMonthResult {
  monthLabel: string;
  rangeLabel: string;
  days: PowerGridDayCell[];
  completionRate: number;
  totalPower: number;
  currentStreak: number;
  hasHabits: boolean;
  loading: boolean;
  error: string | null;
  canGoNext: boolean;
  goPrevWindow: () => void;
  goNextWindow: () => void;
  refresh: () => Promise<void>;
}

export function usePowerGridMonth(
  initialMonth: Date = new Date(),
): UsePowerGridMonthResult {
  const { habits, loading: habitsLoading } = useHabits();
  const { current, loading: streakLoading } = useGlobalStreak();
  const today = useMemo(() => startOfDay(new Date()), []);
  const [windowEndDate, setWindowEndDate] = useState(() =>
    startOfDay(initialMonth),
  );
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const habitIds = useMemo(() => habits.map((habit) => habit.id), [habits]);
  const windowStartDate = useMemo(
    () => startOfDay(subDays(windowEndDate, 13)),
    [windowEndDate],
  );
  const windowEnd = useMemo(() => endOfDay(windowEndDate), [windowEndDate]);

  const load = useCallback(async () => {
    if (habitIds.length === 0) {
      setCheckIns([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await checkinService.getRangeForHabits(
        habitIds,
        windowStartDate,
        windowEnd,
      );
      setCheckIns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown_error');
    } finally {
      setLoading(false);
    }
  }, [habitIds, windowEnd, windowStartDate]);

  useEffect(() => {
    void load();
  }, [load]);

  const { days, completionRate } = useMemo(
    () =>
      buildPowerGridWindow({
        endDate: windowEndDate,
        habits,
        checkIns,
        today,
      }),
    [windowEndDate, habits, checkIns, today],
  );

  const totalPower = useMemo(
    () =>
      habits.reduce(
        (sum, habit) => sum + Math.round(habit.mastery_scores?.score ?? 0),
        0,
      ),
    [habits],
  );

  return {
    monthLabel: format(windowEndDate, 'MMMM'),
    rangeLabel: `${format(windowStartDate, 'dd MMM')} - ${format(windowEndDate, 'dd MMM')}`,
    days,
    completionRate,
    totalPower,
    currentStreak: current,
    hasHabits: habits.length > 0,
    loading: habitsLoading || streakLoading || loading,
    error,
    canGoNext: windowEndDate < today,
    goPrevWindow: () =>
      setWindowEndDate((currentWindowEndDate) =>
        startOfDay(subDays(currentWindowEndDate, 14)),
      ),
    goNextWindow: () =>
      setWindowEndDate((currentWindowEndDate) => {
        const nextWindowEndDate = startOfDay(addDays(currentWindowEndDate, 14));
        return nextWindowEndDate > today ? today : nextWindowEndDate;
      }),
    refresh: load,
  };
}
