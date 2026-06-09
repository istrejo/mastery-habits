import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "../../../core/utils/queryKeys";
import { insertTask, InsertTaskPayload } from "../services/tasksService";

export type CreateTaskPayload = Omit<InsertTaskPayload, "userId" | "dueDate">;

export function useCreateTask(userId: string, date: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) =>
      insertTask({ ...payload, userId, dueDate: date }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.tasks(userId, date) });
    },
  });
}
