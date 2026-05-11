import { useEffect, useMemo, useState } from 'react';
import { useHabits } from '@habits/index';
import { checkinService, type CheckInRecord } from '../services/checkin.service';

interface UseTodayCheckInsResult {
  completedToday: Set<string>;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useTodayCheckIns(): UseTodayCheckInsResult {
  const { habits } = useHabits();
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const habitIds = useMemo(() => habits.map((h) => h.id), [habits]);
  const habitIdsKey = habitIds.join(',');

  const load = async () => {
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
  };

  useEffect(() => {
    void load();
  }, [habitIdsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const completedToday = useMemo(() => {
    const set = new Set<string>();
    for (const r of records) {
      if (r.status === 'completed' || r.status === 'skipped') {
        set.add(r.habit_id);
      }
    }
    return set;
  }, [records]);

  return { completedToday, loading, refresh: load };
}
