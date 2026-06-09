import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCreateTask } from "./useCreateTask";

// Mock env + supabase
jest.mock("../../../core/constants/env", () => ({
  SUPABASE_URL: "https://mock.supabase.co",
  SUPABASE_ANON_KEY: "mock-anon-key",
}));
jest.mock("../../../core/api/supabase", () => ({
  supabase: { from: jest.fn() },
}));

// Mock the service functions
import * as tasksService from "../services/tasksService";
jest.mock("../services/tasksService");

const mockInsertTask = tasksService.insertTask as jest.Mock;
const mockInsertSubTask = tasksService.insertSubTask as jest.Mock;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

const insertedTask = {
  id: "new-1",
  title: "New Task",
  description: null,
  due_date: "2026-06-09",
  is_completed: false,
  completed_at: null,
  parent_id: null,
  priority: "low" as const,
  frequency: "once" as const,
  custom_days: null,
  created_at: "2026-06-09",
  updated_at: "2026-06-09",
  user_id: "user-1",
};

describe("useCreateTask", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls insertTask with userId and task data", async () => {
    mockInsertTask.mockResolvedValue(insertedTask);

    const { result } = renderHook(() => useCreateTask("user-1"), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        title: "New Task",
        due_date: "2026-06-09",
        frequency: "once",
      });
    });

    expect(mockInsertTask).toHaveBeenCalledWith("user-1", {
      title: "New Task",
      due_date: "2026-06-09",
      frequency: "once",
    });
  });

  it("calls insertSubTask for each subtask after creating parent", async () => {
    mockInsertTask.mockResolvedValue(insertedTask);
    mockInsertSubTask.mockResolvedValue({ id: "st-new" });

    const { result } = renderHook(() => useCreateTask("user-1"), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        title: "New Task",
        due_date: "2026-06-09",
        frequency: "once",
        subtasks: [{ title: "Sub 1" }, { title: "Sub 2" }],
      });
    });

    expect(mockInsertTask).toHaveBeenCalledWith("user-1", {
      title: "New Task",
      due_date: "2026-06-09",
      frequency: "once",
    });
    expect(mockInsertSubTask).toHaveBeenCalledTimes(2);
    expect(mockInsertSubTask).toHaveBeenCalledWith("new-1", "user-1", "Sub 1");
    expect(mockInsertSubTask).toHaveBeenCalledWith("new-1", "user-1", "Sub 2");
  });

  it("returns the inserted task", async () => {
    mockInsertTask.mockResolvedValue(insertedTask);

    const { result } = renderHook(() => useCreateTask("user-1"), {
      wrapper: createWrapper(),
    });

    let returned: unknown;
    await act(async () => {
      returned = await result.current.mutateAsync({
        title: "New Task",
        due_date: "2026-06-09",
        frequency: "once",
      });
    });

    expect(returned).toEqual(insertedTask);
  });

  it("passes optional fields to insertTask", async () => {
    mockInsertTask.mockResolvedValue(insertedTask);

    const { result } = renderHook(() => useCreateTask("user-1"), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        title: "Custom Task",
        due_date: "2026-06-09",
        frequency: "custom",
        custom_days: [1, 3, 5],
        description: "A custom task",
      });
    });

    expect(mockInsertTask).toHaveBeenCalledWith("user-1", {
      title: "Custom Task",
      due_date: "2026-06-09",
      frequency: "custom",
      custom_days: [1, 3, 5],
      description: "A custom task",
    });
  });
});
