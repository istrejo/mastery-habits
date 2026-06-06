import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CONFIG, type TimerConfig } from '../utils/DEFAULT_CONFIG';
import { nextPhase } from '../utils/nextPhase';
import type { PomodoroPhase, TimerStatus } from '../types';

interface PomodoroState {
  status: TimerStatus;
  phase: PomodoroPhase;
  cycleIndex: number;
  startedAt: number | null;
  pausedAt: number | null;
  pausedAccumMs: number;
  plannedDurationSeconds: number;
  targetHabitId: string | null;
  targetTaskId: string | null;
  config: TimerConfig;
  autoCheckIn: boolean;

  start: (target?: { habitId?: string; taskId?: string } | null) => void;
  pause: () => void;
  resume: () => void;
  skipPhase: () => void;
  reset: () => void;
  tickFinish: () => void;
  updateConfig: (patch: Partial<TimerConfig>) => void;
  setAutoCheckIn: (value: boolean) => void;
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      phase: 'work',
      cycleIndex: 1,
      startedAt: null,
      pausedAt: null,
      pausedAccumMs: 0,
      plannedDurationSeconds: DEFAULT_CONFIG.workSeconds,
      targetHabitId: null,
      targetTaskId: null,
      config: { ...DEFAULT_CONFIG },
      autoCheckIn: false,

      start: (target) => {
        const { config } = get();
        set({
          status: 'running',
          phase: 'work',
          cycleIndex: 1,
          startedAt: Date.now(),
          pausedAt: null,
          pausedAccumMs: 0,
          plannedDurationSeconds: config.workSeconds,
          targetHabitId: target?.habitId ?? null,
          targetTaskId: target?.taskId ?? null,
        });
      },

      pause: () => {
        const { status } = get();
        if (status !== 'running') return;
        set({ status: 'paused', pausedAt: Date.now() });
      },

      resume: () => {
        const { status, pausedAt, pausedAccumMs } = get();
        if (status !== 'paused' || pausedAt === null) return;
        const additionalPauseMs = Date.now() - pausedAt;
        set({
          status: 'running',
          pausedAt: null,
          pausedAccumMs: pausedAccumMs + additionalPauseMs,
        });
      },

      skipPhase: () => {
        const { phase, cycleIndex, config } = get();
        const transition = nextPhase(phase, cycleIndex, config);
        set({
          status: 'running',
          phase: transition.phase,
          cycleIndex: transition.cycleIndex,
          plannedDurationSeconds: transition.plannedDurationSeconds,
          startedAt: Date.now(),
          pausedAt: null,
          pausedAccumMs: 0,
        });
      },

      reset: () => {
        const { config } = get();
        set({
          status: 'idle',
          phase: 'work',
          cycleIndex: 1,
          startedAt: null,
          pausedAt: null,
          pausedAccumMs: 0,
          plannedDurationSeconds: config.workSeconds,
          targetHabitId: null,
          targetTaskId: null,
        });
      },

      tickFinish: () => {
        const { phase, cycleIndex, config } = get();
        const transition = nextPhase(phase, cycleIndex, config);
        set({
          status: 'finished',
          phase: transition.phase,
          cycleIndex: transition.cycleIndex,
          plannedDurationSeconds: transition.plannedDurationSeconds,
          startedAt: null,
          pausedAt: null,
          pausedAccumMs: 0,
        });
      },

      updateConfig: (patch) => {
        set((state) => ({ config: { ...state.config, ...patch } }));
      },

      setAutoCheckIn: (value) => set({ autoCheckIn: value }),
    }),
    {
      name: 'mastery-habits-pomodoro',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        status: state.status,
        phase: state.phase,
        cycleIndex: state.cycleIndex,
        startedAt: state.startedAt,
        pausedAt: state.pausedAt,
        pausedAccumMs: state.pausedAccumMs,
        plannedDurationSeconds: state.plannedDurationSeconds,
        targetHabitId: state.targetHabitId,
        targetTaskId: state.targetTaskId,
        config: state.config,
        autoCheckIn: state.autoCheckIn,
      }),
    },
  ),
);
