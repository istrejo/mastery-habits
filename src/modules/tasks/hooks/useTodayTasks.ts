import { useCallback, useEffect, useState } from 'react';
import { tasksService } from '../services/tasks.service';
import type { Task } from '../types';

export const useTodayTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tasksService.listToday();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown_error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { tasks, loading, error, refresh: load };
};
