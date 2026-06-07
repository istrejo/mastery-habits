import { startOfDay, subDays } from 'date-fns';
import type { CheckInRecord } from '@checkin/services/checkin.service';
import { calculateStreak } from './calculateStreak';
import type { HabitWithScore } from '@habits/types';

type CheckInStatus = Pick<CheckInRecord, 'check_date' | 'status'>;

type CheckInsByHabit = Record<string, CheckInStatus[]>;

export interface StatsWindowSummary {
  completed: number;
  planned: number;
  percent: number;
}

export interface ActivityGridCell {
  dateKey: string;
  plannedCount: number;
  successCount: number;
  ratio: number;
  intensity: 'none' | 'low' | 'medium' | 'high' | 'veryHigh';
  isToday: boolean;
}

export interface RankedHabit {
  habit: HabitWithScore;
  currentStreak: number;
  bestStreak: number;
  masteryScore: number;
}

export interface StatsMetrics {
  globalCurrentStreak: number;
  globalBestStreak: number;
  completion30d: StatsWindowSummary;
  completionCurrentWeek: StatsWindowSummary;
  completionPreviousWeek: StatsWindowSummary;
  completionDeltaVsPrevWeek: number | null;
  activity30dCells: ActivityGridCell[];
  topHabitsByCurrentStreak: RankedHabit[];
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toIsoDay(date: Date): number {
  return ((date.getDay() + 6) % 7) + 1;
}

function isSuccess(status: CheckInRecord['status'] | undefined): boolean {
  return status === 'completed' || status === 'skipped';
}

function getCheckInMap(checkIns: CheckInStatus[]): Map<string, CheckInRecord['status']> {
  const map = new Map<string, CheckInRecord['status']>();
  for (const record of checkIns) {
    map.set(record.check_date, record.status);
  }
  return map;
}

function getCompletionWindow(
  habits: HabitWithScore[],
  checkInsByHabit: CheckInsByHabit,
  today: Date,
  windowDays: number,
  offsetDays = 0,
): StatsWindowSummary {
  const todayStart = startOfDay(today);
  const checkInMaps = Object.fromEntries(
    habits.map((habit) => [habit.id, getCheckInMap(checkInsByHabit[habit.id] ?? [])]),
  ) as Record<string, Map<string, CheckInRecord['status']>>;
  const plannedDaysSets = new Map(habits.map((h) => [h.id, new Set(h.frequency_days)]));
  let completed = 0;
  let planned = 0;

  for (let index = 0; index < windowDays; index += 1) {
    const date = subDays(todayStart, offsetDays + (windowDays - index - 1));
    const isoDay = toIsoDay(date);
    const dateKey = formatDateKey(date);

    for (const habit of habits) {
      if (!plannedDaysSets.get(habit.id)!.has(isoDay)) continue;
      planned += 1;
      if (isSuccess(checkInMaps[habit.id]?.get(dateKey))) completed += 1;
    }
  }

  return {
    completed,
    planned,
    percent: planned === 0 ? 0 : Math.round((completed / planned) * 100),
  };
}

function getActivityIntensity(plannedCount: number, successCount: number): ActivityGridCell['intensity'] {
  if (plannedCount === 0) return 'none';
  const ratio = successCount / plannedCount;
  if (ratio === 0) return 'low';
  if (ratio < 0.5) return 'medium';
  if (ratio < 1) return 'high';
  return 'veryHigh';
}

function getActivity30dCells(
  habits: HabitWithScore[],
  checkInsByHabit: CheckInsByHabit,
  today: Date,
): ActivityGridCell[] {
  const todayStart = startOfDay(today);
  const checkInMaps = Object.fromEntries(
    habits.map((habit) => [habit.id, getCheckInMap(checkInsByHabit[habit.id] ?? [])]),
  ) as Record<string, Map<string, CheckInRecord['status']>>;
  const plannedDaysSets = new Map(habits.map((h) => [h.id, new Set(h.frequency_days)]));

  return Array.from({ length: 30 }, (_, index) => {
    const date = subDays(todayStart, 29 - index);
    const isoDay = toIsoDay(date);
    const dateKey = formatDateKey(date);
    let plannedCount = 0;
    let successCount = 0;

    for (const habit of habits) {
      if (!plannedDaysSets.get(habit.id)!.has(isoDay)) continue;
      plannedCount += 1;
      if (isSuccess(checkInMaps[habit.id]?.get(dateKey))) successCount += 1;
    }

    const ratio = plannedCount === 0 ? 0 : successCount / plannedCount;

    return {
      dateKey,
      plannedCount,
      successCount,
      ratio,
      intensity: getActivityIntensity(plannedCount, successCount),
      isToday: index === 29,
    };
  });
}

export function deriveStatsMetrics(
  habits: HabitWithScore[],
  checkInsByHabit: CheckInsByHabit,
  today: Date = new Date(),
): StatsMetrics {
  if (habits.length === 0) {
    return {
      globalCurrentStreak: 0,
      globalBestStreak: 0,
      completion30d: { completed: 0, planned: 0, percent: 0 },
      completionCurrentWeek: { completed: 0, planned: 0, percent: 0 },
      completionPreviousWeek: { completed: 0, planned: 0, percent: 0 },
      completionDeltaVsPrevWeek: null,
      activity30dCells: getActivity30dCells([], {}, today),
      topHabitsByCurrentStreak: [],
    };
  }

  const rankedHabits = habits
    .map((habit) => {
      const streak = calculateStreak(habit, checkInsByHabit[habit.id] ?? [], today);
      return {
        habit,
        currentStreak: streak.current,
        bestStreak: streak.best,
        masteryScore: habit.mastery_scores?.score ?? 0,
      };
    })
    .sort((left, right) => {
      if (right.currentStreak !== left.currentStreak) {
        return right.currentStreak - left.currentStreak;
      }
      if (right.masteryScore !== left.masteryScore) {
        return right.masteryScore - left.masteryScore;
      }
      return left.habit.name.localeCompare(right.habit.name);
    });

  const completion30d = getCompletionWindow(habits, checkInsByHabit, today, 30, 0);
  const completionCurrentWeek = getCompletionWindow(habits, checkInsByHabit, today, 7, 0);
  const completionPreviousWeek = getCompletionWindow(habits, checkInsByHabit, today, 7, 7);
  const completionDeltaVsPrevWeek =
    completionPreviousWeek.planned === 0
      ? null
      : completionCurrentWeek.percent - completionPreviousWeek.percent;

  return {
    globalCurrentStreak: Math.min(...rankedHabits.map((entry) => entry.currentStreak)),
    globalBestStreak: Math.max(...rankedHabits.map((entry) => entry.bestStreak)),
    completion30d,
    completionCurrentWeek,
    completionPreviousWeek,
    completionDeltaVsPrevWeek,
    activity30dCells: getActivity30dCells(habits, checkInsByHabit, today),
    topHabitsByCurrentStreak: rankedHabits.slice(0, 3),
  };
}
