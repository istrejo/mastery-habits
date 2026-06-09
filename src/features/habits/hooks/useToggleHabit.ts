import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "../../../core/utils/queryKeys";
import {
  computeStreak,
  deleteHabitLog,
  fetchHabitLogs_forStreak,
  insertHabitLog,
  writeStreak,
} from "../services/habitsService";
import { HabitLog, useHabitsStore } from "../useHabitsStore";

type ToggleVariables = {
  habitId: string;
  userId: string;
  date: string;
  frequency: "daily" | "weekly";
  currentlyCompleted: boolean;
};

export function useToggleHabit() {
  const queryClient = useQueryClient();
  const setToggling = useHabitsStore((s) => s.setToggling);

  return useMutation({
    mutationFn: async ({
      habitId,
      userId,
      date,
      frequency,
      currentlyCompleted,
    }: ToggleVariables) => {
      if (currentlyCompleted) {
        await deleteHabitLog(habitId, userId, date);
      } else {
        await insertHabitLog(habitId, userId, date);
      }

      const allDates = await fetchHabitLogs_forStreak(habitId);
      const streak = computeStreak(allDates, frequency);
      await writeStreak(habitId, streak);
    },

    onMutate: async ({ habitId, userId, date, currentlyCompleted }) => {
      setToggling(habitId, true);

      await queryClient.cancelQueries({ queryKey: qk.habitLogs(userId, date) });

      const previousLogs = queryClient.getQueryData<HabitLog[]>(
        qk.habitLogs(userId, date)
      );

      queryClient.setQueryData<HabitLog[]>(
        qk.habitLogs(userId, date),
        (old = []) => {
          if (currentlyCompleted) {
            return old.filter((log) => log.habit_id !== habitId);
          }
          return [
            ...old,
            {
              id: `optimistic-${habitId}`,
              habit_id: habitId,
              user_id: userId,
              completed_date: date,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ];
        }
      );

      return { previousLogs };
    },

    onSuccess: (_data, { userId, date }) => {
      queryClient.invalidateQueries({ queryKey: qk.habitLogs(userId, date) });
      queryClient.invalidateQueries({ queryKey: qk.habits(userId) });
    },

    onError: (_err, { habitId, userId, date }, context) => {
      if (context?.previousLogs !== undefined) {
        queryClient.setQueryData(
          qk.habitLogs(userId, date),
          context.previousLogs
        );
      }
      setToggling(habitId, false);
    },

    onSettled: (_data, _err, { habitId }) => {
      setToggling(habitId, false);
    },
  });
}
