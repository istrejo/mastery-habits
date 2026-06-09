import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleTask } from "../services/tasksService";
import { useTasksStore } from "../useTasksStore";
import { qk } from "../../../core/api/queryKeys";

interface ToggleTaskInput {
  taskId: string;
  isCompleted: boolean;
}

export function useToggleTask(userId?: string, date?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, isCompleted }: ToggleTaskInput) =>
      toggleTask(taskId, isCompleted),
    onMutate: ({ taskId }: ToggleTaskInput) => {
      useTasksStore.getState().addPendingToggle(taskId);
    },
    onSuccess: () => {
      if (userId && date) {
        queryClient.invalidateQueries({ queryKey: qk.tasks(userId, date) });
      }
    },
    onError: (_error, { taskId }: ToggleTaskInput) => {
      useTasksStore.getState().removePendingToggle(taskId);
    },
    onSettled: (_data, _error, { taskId }: ToggleTaskInput) => {
      useTasksStore.getState().removePendingToggle(taskId);
    },
  });
}
