import { useCallback, useEffect, useState } from 'react';
import { tasksService } from '../services/tasks.service';
import { useTasksStore } from '../states/tasks.store';
import type { TaskWithHabit } from '../types';

export const useTasks = () => {
  const { tasks, setTasks } = useTasksStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tasksService.list();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown_error');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void load();
  }, [load]);

  return { tasks, loading, error, refresh: load };
};
