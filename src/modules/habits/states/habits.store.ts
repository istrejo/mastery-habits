import { create } from 'zustand';
import type { HabitWithScore } from '../types';

interface HabitsState {
  habits: HabitWithScore[];
  selectedHabitId: string | null;
  setHabits: (habits: HabitWithScore[]) => void;
  upsertHabit: (habit: HabitWithScore) => void;
  removeHabit: (id: string) => void;
  selectHabit: (id: string | null) => void;
}

export const useHabitsStore = create<HabitsState>((set) => ({
  habits: [],
  selectedHabitId: null,
  setHabits: (habits) => set({ habits }),
  upsertHabit: (habit) =>
    set((state) => ({
      habits: state.habits.some((h) => h.id === habit.id)
        ? state.habits.map((h) => (h.id === habit.id ? habit : h))
        : [...state.habits, habit],
    })),
  removeHabit: (id) =>
    set((state) => ({ habits: state.habits.filter((h) => h.id !== id) })),
  selectHabit: (id) => set({ selectedHabitId: id }),
}));
