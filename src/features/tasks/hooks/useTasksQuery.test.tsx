import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTasksQuery } from "./useTasksQuery";

// Mock env + supabase so service modules load
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

const mockFetchTasksByDate = tasksService.fetchTasksByDate as jest.Mock;
const mockFetchSubTasks = tasksService.fetchSubTasks as jest.Mock;

const mockTasks = [
  {
    id: "t1",
    title: "Buy groceries",
    description: "Milk, eggs, bread",
    due_date: "2026-06-09",
    is_completed: false,
    completed_at: null,
    parent_id: null,
    priority: "high" as const,
    frequency: "once" as const,
    custom_days: null,
    created_at: "2026-06-01",
    updated_at: "2026-06-01",
    user_id: "user-1",
  },
  {
    id: "t2",
    title: "Read chapter 5",
    description: null,
    due_date: "2026-06-09",
    is_completed: true,
    completed_at: "2026-06-09T10:00:00Z",
    parent_id: null,
    priority: "medium" as const,
    frequency: "daily" as const,
    custom_days: null,
    created_at: "2026-06-02",
    updated_at: "2026-06-02",
    user_id: "user-1",
  },
];

const mockSubTasks = [
  {
    id: "st1",
    title: "Sub-task for t1",
    description: null,
    due_date: "2026-06-09",
    is_completed: false,
    completed_at: null,
    parent_id: "t1",
    priority: "low" as const,
    frequency: "once" as const,
    custom_days: null,
    created_at: "2026-06-03",
    updated_at: "2026-06-03",
    user_id: "user-1",
  },
];

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

describe("useTasksQuery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchTasksByDate.mockResolvedValue(mockTasks);
    mockFetchSubTasks.mockResolvedValue([]);
  });

  it("fetches tasks for userId and date", async () => {
    const { result } = renderHook(
      () => useTasksQuery("user-1", "2026-06-09"),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchTasksByDate).toHaveBeenCalledWith("user-1", "2026-06-09");
    const data = result.current.data!;
    expect(data).toHaveLength(2);
    expect(data[0]).toMatchObject({ id: "t1", subtasks: [] });
    expect(data[1]).toMatchObject({ id: "t2", subtasks: [] });
  });

  it("passes parent id to fetchSubTasks for each task", async () => {
    const { result } = renderHook(
      () => useTasksQuery("user-1", "2026-06-09"),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchSubTasks).toHaveBeenCalledWith("t1");
    expect(mockFetchSubTasks).toHaveBeenCalledWith("t2");
  });

  it("merges sub-tasks into their parent task", async () => {
    mockFetchSubTasks.mockImplementation((parentId: string) => {
      if (parentId === "t1") return Promise.resolve(mockSubTasks);
      return Promise.resolve([]);
    });

    const { result } = renderHook(
      () => useTasksQuery("user-1", "2026-06-09"),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const data = result.current.data!;
    // t1 should have the sub-task merged in
    expect(data[0].subtasks).toHaveLength(1);
    expect(data[0].subtasks[0].id).toBe("st1");
    // t2 should have empty sub-tasks
    expect(data[1].subtasks).toHaveLength(0);
  });

  it("returns an empty array when no tasks exist", async () => {
    mockFetchTasksByDate.mockResolvedValue([]);

    const { result } = renderHook(
      () => useTasksQuery("user-1", "2026-06-09"),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });
});
