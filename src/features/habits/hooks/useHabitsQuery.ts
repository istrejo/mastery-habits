import { useQuery } from "@tanstack/react-query";
import { qk } from "../../../core/api/queryKeys";
import { fetchActiveHabits, fetchLogsForDate } from "../services/habitsService";
import type { Habit, HabitLog } from "../useHabitsStore";

export type HabitWithCompletion = Habit & { completed: boolean };

/**
 * Fetch active habits and merge with completion data for a specific date.
 */
export function useHabitsQuery(userId: string, selectedDate: string) {
  return useQuery({
    queryKey: qk.habits(userId),
    queryFn: async () => {
      const [habits, logs] = await Promise.all([
        fetchActiveHabits(userId),
        fetchLogsForDate(userId, selectedDate),
      ]);

      const logHabitIds = new Set(logs.map((l: HabitLog) => l.habit_id));

      return habits.map((habit) => ({
        ...habit,
        completed: logHabitIds.has(habit.id),
      }));
    },
  });
}
