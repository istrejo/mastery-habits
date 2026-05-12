import { useState, useEffect, useCallback } from 'react';
import { checkinService, type CheckInRecord } from '../services/checkin.service';
import { isPlannedDay } from '../utils/isPlannedDay';
import { hasUsedSkipThisWeek } from '../utils/hasUsedSkipThisWeek';
import type { Habit } from '@habits/types';
import type { Database } from '@shared/types/database.types';

type CheckInStatus = Database['public']['Enums']['checkin_status'];

interface UseCheckInResult {
  todayCheckIn: CheckInRecord | null;
  last30Days: CheckInRecord[];
  allCheckIns: CheckInRecord[];
  canCheckInToday: boolean;
  alreadyCheckedIn: boolean;
  skipAvailable: boolean;
  loading: boolean;
  error: string | null;
  markCompleted: () => Promise<void>;
  markSkipped: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useCheckIn(habit: Habit | null): UseCheckInResult {
  const [todayCheckIn, setTodayCheckIn] = useState<CheckInRecord | null>(null);
  const [last30Days, setLast30Days] = useState<CheckInRecord[]>([]);
  const [allCheckIns, setAllCheckIns] = useState<CheckInRecord[]>([]);
  const [skipAvailable, setSkipAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();

  const load = useCallback(async () => {
    if (!habit) return;
    setLoading(true);
    setError(null);
    try {
      const [checkIn, history, fullHistory, usedSkip] = await Promise.all([
        checkinService.getCheckIn(habit.id, today),
        checkinService.getLast30Days(habit.id),
        checkinService.getAllForHabit(habit.id),
        hasUsedSkipThisWeek(habit.id, today),
      ]);
      setTodayCheckIn(checkIn);
      setLast30Days(history);
      setAllCheckIns(fullHistory);
      setSkipAvailable(!usedSkip);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown_error');
    } finally {
      setLoading(false);
    }
  }, [habit?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void load();
  }, [load]);

  const register = useCallback(
    async (status: CheckInStatus) => {
      if (!habit) return;
      setError(null);
      try {
        await checkinService.register(habit.id, today, status);
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'unknown_error');
      }
    },
    [habit, load], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const canCheckInToday = habit ? isPlannedDay(habit, today) : false;
  const alreadyCheckedIn = todayCheckIn !== null;

  return {
    todayCheckIn,
    last30Days,
    allCheckIns,
    canCheckInToday,
    alreadyCheckedIn,
    skipAvailable,
    loading,
    error,
    markCompleted: () => register('completed'),
    markSkipped: () => register('skipped'),
    refresh: load,
  };
}
