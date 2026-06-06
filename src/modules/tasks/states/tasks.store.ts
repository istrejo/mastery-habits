import { create } from 'zustand';
import type { TaskWithHabit } from '../types';

interface TasksState {
  tasks: TaskWithHabit[];
  setTasks: (tasks: TaskWithHabit[]) => void;
  upsertTask: (task: TaskWithHabit) => void;
  removeTask: (id: string) => void;
}

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],

  setTasks: (tasks) => set({ tasks }),

  upsertTask: (task) =>
    set((state) => {
      const exists = state.tasks.some((t) => t.id === task.id);
      return {
        tasks: exists
          ? state.tasks.map((t) => (t.id === task.id ? task : t))
          : [task, ...state.tasks],
      };
    }),

  removeTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
}));
