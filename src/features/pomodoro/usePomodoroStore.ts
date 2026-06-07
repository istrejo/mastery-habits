import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mmkvStorage } from "../../core/storage/mmkvAdapter";

type TimerPhase = "work" | "shortBreak" | "longBreak";
type TimerStatus = "idle" | "running" | "paused";

interface PomodoroState {
  phase: TimerPhase;
  status: TimerStatus;
  secondsRemaining: number;
  completedSessions: number;
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  setPhase: (phase: TimerPhase) => void;
  setStatus: (status: TimerStatus) => void;
  tick: () => void;
  reset: () => void;
  updateSettings: (settings: Partial<Pick<PomodoroState,
    "workDuration" | "shortBreakDuration" | "longBreakDuration" | "sessionsBeforeLongBreak"
  >>) => void;
}

const DEFAULTS = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  sessionsBeforeLongBreak: 4,
};

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      phase: "work",
      status: "idle",
      secondsRemaining: DEFAULTS.workDuration,
      completedSessions: 0,
      ...DEFAULTS,
      setPhase: (phase) =>
        set((state) => ({
          phase,
          status: "idle",
          secondsRemaining:
            phase === "work"
              ? state.workDuration
              : phase === "shortBreak"
              ? state.shortBreakDuration
              : state.longBreakDuration,
        })),
      setStatus: (status) => set({ status }),
      tick: () => {
        const { secondsRemaining, completedSessions } = get();
        if (secondsRemaining > 0) {
          set({ secondsRemaining: secondsRemaining - 1 });
        } else {
          set({ status: "idle", completedSessions: completedSessions + 1 });
        }
      },
      reset: () =>
        set((state) => ({
          status: "idle",
          secondsRemaining: state.workDuration,
          phase: "work",
        })),
      updateSettings: (settings) => set(settings),
    }),
    {
      name: "pomodoro-store",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        workDuration: state.workDuration,
        shortBreakDuration: state.shortBreakDuration,
        longBreakDuration: state.longBreakDuration,
        sessionsBeforeLongBreak: state.sessionsBeforeLongBreak,
        completedSessions: state.completedSessions,
      }),
    }
  )
);
