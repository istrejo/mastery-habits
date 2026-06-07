import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isBefore,
  isSameMonth,
  isSameDay,
  startOfDay,
  startOfMonth,
  subDays,
} from 'date-fns';
import { resolveCategory } from '@habits/utils/resolveCategory';
import { isPlannedDay } from './isPlannedDay';
import type { CheckInRecord } from '../services/checkin.service';
import type { HabitWithScore } from '@habits/types';

export type PowerGridDayState =
  | 'active'
  | 'missed'
  | 'today'
  | 'future'
  | 'not_planned';

export interface PowerGridDayCell {
  date: string;
  dayNumber: string;
  state: PowerGridDayState;
  icon?: string;
  habitId?: string;
  isToday: boolean;
  isFuture: boolean;
  isOutsideReferenceMonth: boolean;
}

type PowerGridHabit = Pick<
  HabitWithScore,
  'id' | 'frequency_days' | 'category' | 'custom_label' | 'custom_emoji'
> & {
  mastery_scores: Pick<NonNullable<HabitWithScore['mastery_scores']>, 'score'> | null;
};

type PowerGridCheckIn = Pick<CheckInRecord, 'habit_id' | 'check_date' | 'status'>;

interface BuildPowerGridMonthArgs {
  month: Date;
  habits: PowerGridHabit[];
  checkIns: PowerGridCheckIn[];
  today?: Date;
}

interface BuildPowerGridMonthResult {
  days: PowerGridDayCell[];
  completionRate: number;
}

interface BuildPowerGridWindowArgs {
  endDate: Date;
  habits: PowerGridHabit[];
  checkIns: PowerGridCheckIn[];
  today?: Date;
  windowSize?: number;
}

function parseDateKey(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`);
}

function isSuccessfulStatus(status: PowerGridCheckIn['status']) {
  return status === 'completed' || status === 'skipped';
}

function buildPowerGridDays({
  startDate,
  endDate,
  referenceMonth,
  habits,
  checkIns,
  today = new Date(),
}: {
  startDate: Date;
  endDate: Date;
  referenceMonth: Date;
  habits: PowerGridHabit[];
  checkIns: PowerGridCheckIn[];
  today?: Date;
}): BuildPowerGridMonthResult {
  const todayStart = startOfDay(today);

  const habitsById = new Map(habits.map((habit) => [habit.id, habit]));
  const recordsByDate = new Map<string, PowerGridCheckIn[]>();

  for (const record of checkIns) {
    const existing = recordsByDate.get(record.check_date) ?? [];
    existing.push(record);
    recordsByDate.set(record.check_date, existing);
  }

  let completedDays = 0;
  let plannedDays = 0;

  const days = eachDayOfInterval({ start: startDate, end: endDate }).map(
    (day): PowerGridDayCell => {
      const dayKey = format(day, 'yyyy-MM-dd');
      const isTodayCell = isSameDay(day, todayStart);
      const isFuture = isBefore(todayStart, startOfDay(day));
      const plannedHabits = habits.filter((habit) => isPlannedDay(habit, day));
      const plannedHabitIds = new Set(plannedHabits.map((habit) => habit.id));
      const records = (recordsByDate.get(dayKey) ?? []).filter((record) =>
        plannedHabitIds.has(record.habit_id),
      );
      const successfulRecords = records.filter((record) =>
        isSuccessfulStatus(record.status),
      );
      const hasRecords = records.length > 0;

      let state: PowerGridDayState;

      if (isFuture) state = 'future';
      else if (plannedHabits.length === 0) state = 'not_planned';
      else if (isTodayCell && !hasRecords) state = 'today';
      else if (successfulRecords.length > 0) state = 'active';
      else state = 'missed';

      let icon: string | undefined;
      let habitId: string | undefined;

      if (successfulRecords.length > 0) {
        const bestRecord = successfulRecords
          .map((record) => {
            const habit = habitsById.get(record.habit_id);
            return {
              record,
              habit,
              score: habit?.mastery_scores?.score ?? 0,
            };
          })
          .reduce((best, current) => current.score > best.score ? current : best);

        if (bestRecord?.habit) {
          icon = resolveCategory(bestRecord.habit).emoji;
          habitId = bestRecord.habit.id;
        }
      }

      const isSettledPlannedDay =
        plannedHabits.length > 0 && (isBefore(day, todayStart) || hasRecords);

      if (isSettledPlannedDay) {
        plannedDays += 1;
        if (state === 'active') completedDays += 1;
      }

      return {
        date: dayKey,
        dayNumber: format(parseDateKey(dayKey), 'dd'),
        state,
        icon,
        habitId,
        isToday: isTodayCell,
        isFuture,
        isOutsideReferenceMonth: !isSameMonth(day, referenceMonth),
      };
    },
  );

  const completionRate =
    plannedDays > 0 ? Math.round((completedDays / plannedDays) * 100) : 0;

  return { days, completionRate };
}

export function buildPowerGridMonth({
  month,
  habits,
  checkIns,
  today = new Date(),
}: BuildPowerGridMonthArgs): BuildPowerGridMonthResult {
  return buildPowerGridDays({
    startDate: startOfMonth(month),
    endDate: endOfMonth(month),
    referenceMonth: month,
    habits,
    checkIns,
    today,
  });
}

export function buildPowerGridWindow({
  endDate,
  habits,
  checkIns,
  today = new Date(),
  windowSize = 14,
}: BuildPowerGridWindowArgs): BuildPowerGridMonthResult {
  return buildPowerGridDays({
    startDate: startOfDay(subDays(endDate, windowSize - 1)),
    endDate: startOfDay(endDate),
    referenceMonth: endDate,
    habits,
    checkIns,
    today,
  });
}
