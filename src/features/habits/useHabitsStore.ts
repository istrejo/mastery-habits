import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mmkvStorage } from "../../core/storage/mmkvAdapter";

export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: "daily" | "weekly";
  targetDays: number[];
  score: number;
  createdAt: string;
}

interface HabitsState {
  habits: Habit[];
  setHabits: (habits: Habit[]) => void;
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  removeHabit: (id: string) => void;
  reset: () => void;
}

export const useHabitsStore = create<HabitsState>()(
  persist(
    (set) => ({
      habits: [],
      setHabits: (habits) => set({ habits }),
      addHabit: (habit) => set((state) => ({ habits: [...state.habits, habit] })),
      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        })),
      removeHabit: (id) =>
        set((state) => ({ habits: state.habits.filter((h) => h.id !== id) })),
      reset: () => set({ habits: [] }),
    }),
    {
      name: "habits-store",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
