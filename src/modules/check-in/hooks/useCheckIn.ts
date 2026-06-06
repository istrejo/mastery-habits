import { useState, useEffect, useCallback } from 'react';
import { checkinService, CheckInError, type CheckInErrorCode, type CheckInRecord } from '../services/checkin.service';
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
  errorCode: CheckInErrorCode | null;
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
  const [errorCode, setErrorCode] = useState<CheckInErrorCode | null>(null);

  const load = useCallback(async (date: Date = new Date()) => {
    if (!habit) {
      setTodayCheckIn(null);
      setLast30Days([]);
      setAllCheckIns([]);
      setSkipAvailable(false);
      return;
    }

    setLoading(true);
    setErrorCode(null);
    try {
      const [checkIn, history, fullHistory, usedSkip] = await Promise.all([
        checkinService.getCheckIn(habit.id, date),
        checkinService.getLast30Days(habit.id),
        checkinService.getAllForHabit(habit.id),
        hasUsedSkipThisWeek(habit.id, date),
      ]);
      setTodayCheckIn(checkIn);
      setLast30Days(history);
      setAllCheckIns(fullHistory);
      setSkipAvailable(!usedSkip);
    } catch (err) {
      setErrorCode(err instanceof CheckInError ? err.code : 'unknown_error');
    } finally {
      setLoading(false);
    }
  }, [habit]);

  useEffect(() => {
    void load();
  }, [load]);

  const register = useCallback(
    async (status: CheckInStatus) => {
      if (!habit) return;

      const currentDate = new Date();
      setErrorCode(null);
      try {
        await checkinService.register(habit.id, currentDate, status);
        await load(currentDate);
      } catch (err) {
        setErrorCode(err instanceof CheckInError ? err.code : 'unknown_error');
      }
    },
    [habit, load],
  );

  const canCheckInToday = habit ? isPlannedDay(habit, new Date()) : false;
  const alreadyCheckedIn = todayCheckIn !== null;

  return {
    todayCheckIn,
    last30Days,
    allCheckIns,
    canCheckInToday,
    alreadyCheckedIn,
    skipAvailable,
    loading,
    errorCode,
    markCompleted: () => register('completed'),
    markSkipped: () => register('skipped'),
    refresh: load,
  };
}
