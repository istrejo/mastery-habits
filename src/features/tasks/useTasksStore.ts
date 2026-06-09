import { create } from "zustand";
import { Database } from "../../shared/types/database.types";

export type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TasksOptimisticState {
  togglingIds: Set<string>;
  setToggling: (id: string, value: boolean) => void;
}

export const useTasksStore = create<TasksOptimisticState>()((set) => ({
  togglingIds: new Set(),
  setToggling: (id, value) =>
    set((state) => {
      const next = new Set(state.togglingIds);
      value ? next.add(id) : next.delete(id);
      return { togglingIds: next };
    }),
}));
