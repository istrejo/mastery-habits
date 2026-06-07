import { parseISO, subDays, addDays, isSameDay, startOfDay } from 'date-fns';
import { isPlannedDay } from '@checkin/utils/isPlannedDay';
import type { Habit } from '@habits/types';
import type { CheckInRecord } from '@checkin/services/checkin.service';

export interface StreakResult {
  current: number;
  best: number;
}

const MAX_LOOKBACK_DAYS = 365;
const MAX_WALK_DAYS = 365 * 5;

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function calculateStreak(
  habit: Pick<Habit, 'frequency_days'>,
  checkIns: Pick<CheckInRecord, 'check_date' | 'status'>[],
  today: Date = new Date(),
): StreakResult {
  const todayStart = startOfDay(today);

  const checkInMap = new Map<string, 'completed' | 'skipped' | 'missed'>();
  for (const ci of checkIns) {
    checkInMap.set(ci.check_date, ci.status as 'completed' | 'skipped' | 'missed');
  }

  let current = 0;
  let cursor = todayStart;

  for (let i = 0; i < MAX_LOOKBACK_DAYS; i++) {
    if (isPlannedDay(habit, cursor)) {
      const status = checkInMap.get(formatDateKey(cursor));

      if (status === 'completed' || status === 'skipped') {
        current += 1;
      } else if (isSameDay(cursor, todayStart) && status === undefined) {
        // Today not yet checked-in — does not break streak yet
      } else {
        break;
      }
    }
    cursor = subDays(cursor, 1);
  }

  let best = 0;
  let running = 0;
  const sortedDates = [...checkInMap.keys()].sort();

  if (sortedDates.length === 0) {
    return { current, best: current };
  }

  let walk = startOfDay(parseISO(sortedDates[0]!));

  for (let i = 0; i < MAX_WALK_DAYS && walk <= todayStart; i++) {
    if (isPlannedDay(habit, walk)) {
      const status = checkInMap.get(formatDateKey(walk));
      const isToday = isSameDay(walk, todayStart);

      if (status === 'completed' || status === 'skipped') {
        running += 1;
        if (running > best) best = running;
      } else if (isToday && status === undefined) {
        // Skip today if unchecked — don't reset
      } else {
        running = 0;
      }
    }
    walk = addDays(walk, 1);
  }

  return { current, best: Math.max(best, current) };
}

function calculateGlobalStreak(
  habits: Pick<Habit, 'id' | 'frequency_days'>[],
  checkInsByHabit: Record<string, Pick<CheckInRecord, 'check_date' | 'status'>[]>,
  today: Date = new Date(),
): StreakResult {
  if (habits.length === 0) return { current: 0, best: 0 };

  const perHabit = habits.map((h) =>
    calculateStreak(h, checkInsByHabit[h.id] ?? [], today),
  );

  const current = Math.min(...perHabit.map((s) => s.current));
  const best = Math.max(...perHabit.map((s) => s.best));

  return { current, best };
}
