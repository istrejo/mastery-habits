import { useQuery } from "@tanstack/react-query";
import { qk } from "../../../core/utils/queryKeys";
import { fetchActiveHabits, fetchHabitLogs } from "../services/habitsService";
import { Habit, HabitLog } from "../useHabitsStore";

export type HabitWithCompletion = Habit & { completed: boolean };

export function useHabitsQuery(userId: string, date: string) {
  const { data: habitsData, isLoading: habitsLoading, error: habitsError } = useQuery({
    queryKey: qk.habits(userId),
    queryFn: () => fetchActiveHabits(userId),
    staleTime: 30_000,
    enabled: !!userId,
  });

  const { data: logsData, isLoading: logsLoading, error: logsError } = useQuery({
    queryKey: qk.habitLogs(userId, date),
    queryFn: () => fetchHabitLogs(userId, date),
    staleTime: 30_000,
    enabled: !!userId,
  });

  const habits: Habit[] = habitsData ?? [];
  const logs: HabitLog[] = logsData ?? [];

  const habitsWithCompletion: HabitWithCompletion[] = habits.map((habit) => ({
    ...habit,
    completed: logs.some((log) => log.habit_id === habit.id),
  }));

  return {
    habitsWithCompletion,
    isLoading: habitsLoading || logsLoading,
    error: habitsError ?? logsError,
  };
}
