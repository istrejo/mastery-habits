import { useEffect, useState, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { usePomodoroStore } from '../states/pomodoro.store';
import { computeRemaining } from '../utils/computeRemaining';

export const useTimerTick = (): number => {
  const status = usePomodoroStore((s) => s.status);
  const startedAt = usePomodoroStore((s) => s.startedAt);
  const pausedAccumMs = usePomodoroStore((s) => s.pausedAccumMs);
  const plannedDurationSeconds = usePomodoroStore((s) => s.plannedDurationSeconds);
  const tickFinish = usePomodoroStore((s) => s.tickFinish);

  const [remaining, setRemaining] = useState(() =>
    computeRemaining(startedAt, plannedDurationSeconds, pausedAccumMs),
  );

  const tickFinishRef = useRef(tickFinish);
  tickFinishRef.current = tickFinish;

  useEffect(() => {
    if (status !== 'running') {
      setRemaining(computeRemaining(startedAt, plannedDurationSeconds, pausedAccumMs));
      return;
    }

    const tick = () => {
      const r = computeRemaining(startedAt, plannedDurationSeconds, pausedAccumMs);
      setRemaining(r);
      if (r <= 0) tickFinishRef.current();
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [status, startedAt, pausedAccumMs, plannedDurationSeconds]);

  // Re-compute on foreground to catch background time
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        const r = computeRemaining(startedAt, plannedDurationSeconds, pausedAccumMs);
        setRemaining(r);
        if (r <= 0 && status === 'running') tickFinishRef.current();
      }
    });
    return () => sub.remove();
  }, [startedAt, pausedAccumMs, plannedDurationSeconds, status]);

  return remaining;
};
