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

    Promise.all(
      habits.map(async (h) => {
        const records = await checkinService.getLast30Days(h.id);
        return [h.id, records] as const;
      }),
    )
      .then((entries) => {
        if (cancelled) return;
        const map: Record<string, CheckInRecord[]> = {};
        for (const [id, recs] of entries) map[id] = recs;
        setCheckInsByHabit(map);
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
