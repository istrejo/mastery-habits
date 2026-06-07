import { useRef, useCallback, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { usePomodoroStore } from '../states/pomodoro.store';
import { pomodoroService } from '../services/pomodoro.service';
import { useTimerTick } from './useTimerTick';
import type { PomodoroPhase } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowList: true,
  }),
});

type SessionFinishCallback = (result: {
  phase: PomodoroPhase;
  prevPhase: PomodoroPhase;
  targetHabitId: string | null;
  targetTaskId: string | null;
  plannedDurationSeconds: number;
}) => void;

export const usePomodoroTimer = () => {
  const store = usePomodoroStore();
  const remainingSeconds = useTimerTick();

  const prevPhaseRef = useRef<PomodoroPhase>(store.phase);
  const finishCallbackRef = useRef<SessionFinishCallback | null>(null);
  const sessionRecordedRef = useRef(false);

  const onSessionFinish = useCallback((cb: SessionFinishCallback) => {
    finishCallbackRef.current = cb;
    return () => { finishCallbackRef.current = null; };
  }, []);

  useEffect(() => {
    if (store.status === 'finished' && !sessionRecordedRef.current) {
      sessionRecordedRef.current = true;
      const prevPhase = prevPhaseRef.current;

      // Notify user (works when app is backgrounded)
      void Notifications.scheduleNotificationAsync({
        content: {
          title: prevPhase === 'work' ? 'Fase completada' : 'Descanso terminado',
          body: prevPhase === 'work' ? 'Buen trabajo. Tomá un descanso.' : '¡A trabajar!',
        },
        trigger: null,
      });

      // Record session in DB (fire-and-forget)
      void pomodoroService.recordSession({
        habit_id: store.targetHabitId,
        task_id: store.targetTaskId,
        phase: prevPhase,
        planned_duration_seconds: store.plannedDurationSeconds,
        actual_duration_seconds: store.plannedDurationSeconds,
        outcome: 'completed',
        cycle_index: store.cycleIndex,
        started_at: new Date(store.startedAt ?? Date.now()).toISOString(),
        ended_at: new Date().toISOString(),
      });

      finishCallbackRef.current?.({
        phase: store.phase,
        prevPhase,
        targetHabitId: store.targetHabitId,
        targetTaskId: store.targetTaskId,
        plannedDurationSeconds: store.plannedDurationSeconds,
      });
    }

    if (store.status !== 'finished') {
      sessionRecordedRef.current = false;
    }

    prevPhaseRef.current = store.phase;
  }, [
    store.status,
    store.targetHabitId,
    store.targetTaskId,
    store.phase,
    store.plannedDurationSeconds,
    store.cycleIndex,
    store.startedAt,
  ]);

  return {
    status: store.status,
    phase: store.phase,
    cycleIndex: store.cycleIndex,
    remainingSeconds,
    targetHabitId: store.targetHabitId,
    targetTaskId: store.targetTaskId,
    autoCheckIn: store.autoCheckIn,
    config: store.config,
    start: store.start,
    pause: store.pause,
    resume: store.resume,
    skipPhase: store.skipPhase,
    reset: store.reset,
    setAutoCheckIn: store.setAutoCheckIn,
    onSessionFinish,
  };
};
