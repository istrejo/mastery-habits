import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "../../../core/utils/queryKeys";
import { toggleTask } from "../services/tasksService";
import { useTasksStore, Task } from "../useTasksStore";

interface ToggleVariables {
  id: string;
  userId: string;
  date: string;
  isCompleted: boolean;
}

export function useToggleTask() {
  const queryClient = useQueryClient();
  const setToggling = useTasksStore((s) => s.setToggling);

  return useMutation({
    mutationFn: ({ id, isCompleted }: ToggleVariables) =>
      toggleTask(id, isCompleted),

    onMutate: async ({ id, userId, date, isCompleted }) => {
      setToggling(id, true);

      const key = qk.tasks(userId, date);
      await queryClient.cancelQueries({ queryKey: key });

      const snapshot = queryClient.getQueryData<Task[]>(key);

      queryClient.setQueryData<Task[]>(key, (old) =>
        (old ?? []).map((t) =>
          t.id === id
            ? {
                ...t,
                is_completed: isCompleted,
                completed_at: isCompleted ? new Date().toISOString() : null,
              }
            : t
        )
      );

      return { snapshot, userId, date };
    },

    onSuccess: (_data, { userId, date }) => {
      queryClient.invalidateQueries({ queryKey: qk.tasks(userId, date) });
    },

    onError: (_err, { id, userId, date }, ctx) => {
      setToggling(id, false);
      if (ctx?.snapshot !== undefined) {
        queryClient.setQueryData(qk.tasks(userId, date), ctx.snapshot);
      }
    },

    onSettled: (_data, _err, { id }) => {
      setToggling(id, false);
    },
  });
}
