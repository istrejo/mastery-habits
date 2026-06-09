import { useTasksStore } from "./useTasksStore";

describe("useTasksStore", () => {
  beforeEach(() => {
    useTasksStore.getState().reset();
  });

  it("starts with an empty pendingToggles set", () => {
    const state = useTasksStore.getState();
    expect(state.pendingToggles.size).toBe(0);
  });

  it("addPendingToggle adds a task id to the set", () => {
    useTasksStore.getState().addPendingToggle("task-1");
    expect(useTasksStore.getState().pendingToggles.has("task-1")).toBe(true);
    expect(useTasksStore.getState().pendingToggles.size).toBe(1);
  });

  it("addPendingToggle is idempotent for the same id", () => {
    useTasksStore.getState().addPendingToggle("task-1");
    useTasksStore.getState().addPendingToggle("task-1");
    expect(useTasksStore.getState().pendingToggles.size).toBe(1);
  });

  it("removePendingToggle removes a task id from the set", () => {
    useTasksStore.getState().addPendingToggle("task-1");
    useTasksStore.getState().addPendingToggle("task-2");
    useTasksStore.getState().removePendingToggle("task-1");
    expect(useTasksStore.getState().pendingToggles.has("task-1")).toBe(false);
    expect(useTasksStore.getState().pendingToggles.has("task-2")).toBe(true);
    expect(useTasksStore.getState().pendingToggles.size).toBe(1);
  });

  it("removePendingToggle is safe for non-existent ids", () => {
    useTasksStore.getState().removePendingToggle("nonexistent");
    expect(useTasksStore.getState().pendingToggles.size).toBe(0);
  });

  it("reset clears all pending toggles", () => {
    useTasksStore.getState().addPendingToggle("task-1");
    useTasksStore.getState().addPendingToggle("task-2");
    useTasksStore.getState().reset();
    expect(useTasksStore.getState().pendingToggles.size).toBe(0);
  });
});
