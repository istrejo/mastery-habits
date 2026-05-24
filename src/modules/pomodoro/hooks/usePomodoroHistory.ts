import { useCallback, useEffect, useState } from 'react';
import { pomodoroService } from '../services/pomodoro.service';
import type { PomodoroSession } from '../types';

export const usePomodoroHistory = () => {
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pomodoroService.listRecent(20);
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown_error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { sessions, loading, error, refresh: load };
};
