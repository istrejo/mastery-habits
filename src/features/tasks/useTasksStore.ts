import { create } from "zustand";

interface TasksState {
  /** Task IDs currently being toggled (optimistic UI) */
  pendingToggles: Set<string>;
  addPendingToggle: (taskId: string) => void;
  removePendingToggle: (taskId: string) => void;
  reset: () => void;
}

export const useTasksStore = create<TasksState>()((set) => ({
  pendingToggles: new Set<string>(),
  addPendingToggle: (taskId) =>
    set((state) => ({
      pendingToggles: new Set(state.pendingToggles).add(taskId),
    })),
  removePendingToggle: (taskId) =>
    set((state) => {
      const next = new Set(state.pendingToggles);
      next.delete(taskId);
      return { pendingToggles: next };
    }),
  reset: () => set({ pendingToggles: new Set<string>() }),
}));
