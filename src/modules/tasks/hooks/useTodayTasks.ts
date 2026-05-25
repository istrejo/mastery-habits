import { useCallback, useEffect, useState } from 'react';
import { tasksService } from '../services/tasks.service';
import { tasksCacheService } from '../services/tasksCache.service';
import type { TaskWithHabit } from '../types';

export const useTodayTasks = () => {
  const [tasks, setTasks] = useState<TaskWithHabit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const cached = await tasksCacheService.load();
    if (cached.length > 0) {
      setTasks(cached);
    }

    try {
      const data = await tasksService.listToday();
      setTasks(data);
      await tasksCacheService.save(data);
    } catch (err) {
      if (cached.length === 0) {
        setError(err instanceof Error ? err.message : 'unknown_error');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTaskOptimistic = useCallback(
    (taskId: string, updates: Partial<TaskWithHabit>) => {
      setTasks((current) => {
        const updated = current.map((t) =>
          t.id === taskId ? { ...t, ...updates } : t
        );
        void tasksCacheService.save(updated);
        return updated;
      });
    },
    []
  );

  const updateSubtaskOptimistic = useCallback(
    (taskId: string, subtaskId: string, status: 'completed' | 'pending') => {
      setTasks((current) => {
        const updated = current.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            task_subtasks: t.task_subtasks.map((st) =>
              st.id === subtaskId
                ? {
                    ...st,
                    status,
                    completed_at:
                      status === 'completed' ? new Date().toISOString() : null,
                  }
                : st
            ),
          };
        });
        void tasksCacheService.save(updated);
        return updated;
      });
    },
    []
  );

  const addTaskOptimistic = useCallback((task: TaskWithHabit) => {
    setTasks((current) => {
      const updated = [task, ...current];
      void tasksCacheService.save(updated);
      return updated;
    });
  }, []);

  const removeTaskOptimistic = useCallback((taskId: string) => {
    setTasks((current) => {
      const updated = current.filter((t) => t.id !== taskId);
      void tasksCacheService.save(updated);
      return updated;
    });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    tasks,
    loading,
    error,
    refresh: load,
    updateTaskOptimistic,
    updateSubtaskOptimistic,
    addTaskOptimistic,
    removeTaskOptimistic,
  };
};
