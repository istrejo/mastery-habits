import { useEffect, useMemo, useState } from 'react';
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

export function useGlobalStreak(): UseGlobalStreakResult {
  const { habits } = useHabits();
  const user = useSessionStore((s) => s.user);
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

  return useMemo(() => {
    if (habits.length === 0) return { current: 0, best: 0, loading };

    const perHabit = habits.map((h) =>
      calculateStreak(h, checkInsByHabit[h.id] ?? []),
    );

    const current = Math.min(...perHabit.map((s) => s.current));
    const best = Math.max(...perHabit.map((s) => s.best));

    return { current, best, loading };
  }, [habits, checkInsByHabit, loading]);
}
