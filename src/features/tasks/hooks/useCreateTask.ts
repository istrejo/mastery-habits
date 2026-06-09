import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertTask, insertSubTask } from "../services/tasksService";
import { qk } from "../../../core/api/queryKeys";
import type { Database } from "../../../shared/types/database.types";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type TaskFrequency = Database["public"]["Enums"]["task_frequency"];

interface CreateTaskInput {
  title: string;
  due_date: string;
  frequency: TaskFrequency;
  custom_days?: number[];
  description?: string;
  subtasks?: { title: string }[];
}

export function useCreateTask(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskInput): Promise<TaskRow> => {
      const { subtasks, ...taskData } = data;
      const inserted = await insertTask(userId, taskData);

      if (subtasks && subtasks.length > 0) {
        await Promise.all(
          subtasks.map((st) => insertSubTask(inserted.id, userId, st.title)),
        );
      }

      return inserted;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: qk.tasks(userId, variables.due_date),
      });
    },
  });
}
