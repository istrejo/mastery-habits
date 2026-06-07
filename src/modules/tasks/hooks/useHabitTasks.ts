import { useCallback, useEffect, useState } from 'react';
import { useSyncStore } from '@core/states/sync.store';
import { tasksService } from '../services/tasks.service';
import { useTasksStore } from '../states/tasks.store';
import type { TaskWithHabit } from '../types';

export const useHabitTasks = (habitId: string) => {
  const lastSyncAt = useSyncStore((state) => state.lastSyncAt);
  const { upsertTask } = useTasksStore();
  const [tasks, setTasks] = useState<TaskWithHabit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tasksService.listByHabit(habitId);
      setTasks(data);
      data.forEach((t) => upsertTask(t));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown_error');
    } finally {
      setLoading(false);
    }
  }, [habitId, upsertTask]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!lastSyncAt) return;
    void load();
  }, [lastSyncAt, load]);

  return { tasks, loading, error, refresh: load };
};
