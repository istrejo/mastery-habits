import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "../../../core/api/queryKeys";
import { useHabitsStore } from "../useHabitsStore";
import {
  insertHabitLog,
  deleteHabitLog,
} from "../services/habitsService";
import { recomputeStreak } from "../services/streakRecompute";

interface ToggleVariables {
  habitId: string;
  checked: boolean;
  frequency: "daily" | "weekly";
}

/**
 * Optimistic toggle for habit completion.
 *
 * - Unchecked → insertHabitLog → recomputeStreak
 * - Checked   → deleteHabitLog  → recomputeStreak
 *
 * Optimistic state tracked via `useHabitsStore.pendingToggles`.
 */
export function useToggleHabit(userId: string, selectedDate: string) {
  const queryClient = useQueryClient();
  const { addPendingToggle, removePendingToggle } = useHabitsStore();

  return useMutation({
    mutationFn: async ({ habitId, checked, frequency }: ToggleVariables) => {
      if (checked) {
        // Uncheck → remove the log
        await deleteHabitLog(habitId, selectedDate);
      } else {
        // Check → insert the log
        await insertHabitLog(habitId, userId, selectedDate);
      }

      // Recompute and write streak after the log change
      await recomputeStreak(habitId, frequency);
    },
    onMutate: ({ habitId }: ToggleVariables) => {
      addPendingToggle(habitId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.habits(userId) });
      queryClient.invalidateQueries({ queryKey: qk.habitLogs(userId, selectedDate) });
    },
    onError: (_error, { habitId }: ToggleVariables) => {
      removePendingToggle(habitId);
    },
    onSettled: (_data, _error, { habitId }: ToggleVariables) => {
      removePendingToggle(habitId);
    },
  });
}
