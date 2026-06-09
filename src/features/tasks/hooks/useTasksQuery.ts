import { useQuery } from "@tanstack/react-query";
import { qk } from "../../../core/utils/queryKeys";
import { fetchTopLevelTasks, fetchSubTasks } from "../services/tasksService";
import { Task } from "../useTasksStore";

export function useTasksQuery(userId: string, date: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: qk.tasks(userId, date),
    queryFn: () => fetchTopLevelTasks(userId, date),
    enabled: !!userId && !!date,
  });

  return {
    tasks: (data ?? []) as Task[],
    isLoading,
    error,
  };
}

export function useSubTasksQuery(parentId: string | null) {
  const { data, isLoading } = useQuery({
    queryKey: qk.subtasks(parentId ?? ""),
    queryFn: () => fetchSubTasks(parentId!),
    enabled: !!parentId,
  });

  return {
    subtasks: (data ?? []) as Task[],
    isLoading,
  };
}
