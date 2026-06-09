import { useQuery, useQueries } from "@tanstack/react-query";
import { fetchTasksByDate, fetchSubTasks } from "../services/tasksService";
import { qk } from "../../../core/api/queryKeys";
import type { Database } from "../../../shared/types/database.types";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

export interface TaskWithSubTasks extends TaskRow {
  subtasks: TaskRow[];
}

export function useTasksQuery(userId: string, date: string) {
  const tasksQuery = useQuery({
    queryKey: qk.tasks(userId, date),
    queryFn: () => fetchTasksByDate(userId, date),
  });

  const tasks = tasksQuery.data ?? [];

  const subTaskQueries = useQueries({
    queries: tasks.map((task) => ({
      queryKey: qk.subtasks(task.id),
      queryFn: () => fetchSubTasks(task.id),
      enabled: !!task.id && tasksQuery.isSuccess,
    })),
  });

  const tasksWithSubs: TaskWithSubTasks[] = tasks.map((task, i) => ({
    ...task,
    subtasks: (subTaskQueries[i]?.data ?? []) as TaskRow[],
  }));

  return {
    ...tasksQuery,
    data: tasksWithSubs,
  };
}
