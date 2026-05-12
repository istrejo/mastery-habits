import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHabits } from '@habits/index';
import { checkinService, type CheckInRecord } from '../services/checkin.service';

interface UseTodayCheckInsResult {
  completedToday: Set<string>;
  submittingHabitIds: Set<string>;
  loading: boolean;
  completeHabit: (habitId: string) => Promise<void>;
  undoHabit: (habitId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTodayCheckIns(): UseTodayCheckInsResult {
  const { habits, fetchHabits } = useHabits();
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingHabitIds, setSubmittingHabitIds] = useState<Set<string>>(new Set());

  const habitIds = useMemo(() => habits.map((h) => h.id), [habits]);
  const habitIdsKey = habitIds.join(',');

  const load = useCallback(async () => {
    if (habitIds.length === 0) {
      setRecords([]);
      return;
    }
    setLoading(true);
    try {
      const data = await checkinService.getTodayForHabits(habitIds);
      setRecords(data);
    } finally {
      setLoading(false);
    }
  }, [habitIdsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void load();
  }, [load]);

  const completedToday = useMemo(() => {
    const set = new Set<string>();
    for (const r of records) {
      if (r.status === 'completed' || r.status === 'skipped') {
        set.add(r.habit_id);
      }
    }
    return set;
  }, [records]);

  const completeHabit = useCallback(async (habitId: string) => {
    setSubmittingHabitIds((current) => {
      const next = new Set(current);
      next.add(habitId);
      return next;
    });

    try {
      await checkinService.register(habitId, new Date(), 'completed');
      await Promise.all([load(), fetchHabits()]);
    } finally {
      setSubmittingHabitIds((current) => {
        const next = new Set(current);
        next.delete(habitId);
        return next;
      });
    }
  }, [fetchHabits, load]);

  const undoHabit = useCallback(async (habitId: string) => {
    const habit = habits.find((item) => item.id === habitId);
    if (!habit) throw new Error('habit_not_found');

    setSubmittingHabitIds((current) => {
      const next = new Set(current);
      next.add(habitId);
      return next;
    });

    try {
      await checkinService.undo(habit, new Date());
      await Promise.all([load(), fetchHabits()]);
    } finally {
      setSubmittingHabitIds((current) => {
        const next = new Set(current);
        next.delete(habitId);
        return next;
      });
    }
  }, [fetchHabits, habits, load]);

  return { completedToday, submittingHabitIds, loading, completeHabit, undoHabit, refresh: load };
}
