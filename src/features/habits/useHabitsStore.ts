import { create } from "zustand";
import { Database } from "../../shared/types/database.types";

export type Habit = Database["public"]["Tables"]["habits"]["Row"];
export type HabitLog = Database["public"]["Tables"]["habit_logs"]["Row"];

interface HabitsState {
  /** Habit IDs currently being toggled (optimistic UI) */
  pendingToggles: Set<string>;
  addPendingToggle: (habitId: string) => void;
  removePendingToggle: (habitId: string) => void;
  reset: () => void;
}

export const useHabitsStore = create<HabitsState>()((set) => ({
  pendingToggles: new Set<string>(),
  addPendingToggle: (habitId) =>
    set((state) => ({
      pendingToggles: new Set(state.pendingToggles).add(habitId),
    })),
  removePendingToggle: (habitId) =>
    set((state) => {
      const next = new Set(state.pendingToggles);
      next.delete(habitId);
      return { pendingToggles: next };
    }),
  reset: () => set({ pendingToggles: new Set<string>() }),
}));
