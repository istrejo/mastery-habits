import {
  addDays,
  endOfDay,
  isAfter,
  isSameDay,
  startOfDay,
  subDays,
} from 'date-fns';

type CheckInStatus = 'completed' | 'skipped' | 'missed';

export interface HabitDetailCheckInLike {
  check_date: string;
  status: CheckInStatus;
}

export type WeeklyRhythmStatus =
  | 'completed'
  | 'skipped'
  | 'missed'
  | 'pending'
  | 'rest';

export interface WeeklyRhythmDay {
  date: Date;
  dateKey: string;
  isoDay: number;
  planned: boolean;
  isToday: boolean;
  status: WeeklyRhythmStatus;
}

export interface CompletionSummary {
  completed: number;
  planned: number;
  percent: number;
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCheckInMap(checkIns: HabitDetailCheckInLike[]) {
  const map = new Map<string, CheckInStatus>();
  for (const record of checkIns) {
    map.set(record.check_date, record.status);
  }
  return map;
}

export function getWeekStartMonday(today: Date = new Date()): Date {
  const start = startOfDay(today);
  const isoDay = ((start.getDay() + 6) % 7) + 1;
  return subDays(start, isoDay - 1);
}

export function getWeeklyRhythm(
  frequencyDays: number[],
  checkIns: HabitDetailCheckInLike[],
  today: Date = new Date(),
): WeeklyRhythmDay[] {
  const weekStart = getWeekStartMonday(today);
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const checkInMap = getCheckInMap(checkIns);

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const dateKey = formatDateKey(date);
    const isoDay = index + 1;
    const planned = frequencyDays.includes(isoDay);
    const recordStatus = checkInMap.get(dateKey);

    let status: WeeklyRhythmStatus = 'rest';

    if (planned) {
      if (recordStatus) {
        status = recordStatus;
      } else if (isAfter(date, todayEnd)) {
        status = 'pending';
      } else if (isSameDay(date, todayStart)) {
        status = 'pending';
      } else {
        status = 'missed';
      }
    }

    return {
      date,
      dateKey,
      isoDay,
      planned,
      isToday: isSameDay(date, todayStart),
      status,
    };
  });
}

export function getMonthlyCompletion(
  frequencyDays: number[],
  checkIns: HabitDetailCheckInLike[],
  today: Date = new Date(),
  windowDays = 30,
): CompletionSummary {
  const checkInMap = getCheckInMap(checkIns);
  const todayStart = startOfDay(today);
  let completed = 0;
  let planned = 0;

  for (let index = 0; index < windowDays; index += 1) {
    const date = subDays(todayStart, windowDays - index - 1);
    const isoDay = ((date.getDay() + 6) % 7) + 1;

    if (!frequencyDays.includes(isoDay)) continue;

    planned += 1;
    const status = checkInMap.get(formatDateKey(date));
    if (status === 'completed' || status === 'skipped') completed += 1;
  }

  return {
    completed,
    planned,
    percent: planned === 0 ? 0 : Math.round((completed / planned) * 100),
  };
}

export function getAverageSuccessfulCheckInsPerWeek(
  checkIns: HabitDetailCheckInLike[],
  today: Date = new Date(),
  windowDays = 28,
): number {
  const start = startOfDay(subDays(today, windowDays - 1));
  const successful = checkIns.filter((record) => {
    if (record.status !== 'completed' && record.status !== 'skipped') return false;
    const date = startOfDay(new Date(`${record.check_date}T12:00:00`));
    return !isAfter(start, date);
  }).length;

  return Number((successful / (windowDays / 7)).toFixed(1));
}
