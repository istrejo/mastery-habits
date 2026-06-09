import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useHabitsQuery } from "./useHabitsQuery";

// Mock env + supabase so service modules load
jest.mock("../../../core/constants/env", () => ({
  SUPABASE_URL: "https://mock.supabase.co",
  SUPABASE_ANON_KEY: "mock-anon-key",
}));
jest.mock("../../../core/api/supabase", () => ({
  supabase: { from: jest.fn() },
}));

// Mock the service functions
import * as habitsService from "../services/habitsService";
jest.mock("../services/habitsService");

const mockFetchActiveHabits = habitsService.fetchActiveHabits as jest.Mock;
const mockFetchLogsForDate = habitsService.fetchLogsForDate as jest.Mock;

const mockHabits = [
  {
    id: "h1",
    title: "Exercise",
    color: "#FF0000",
    frequency: "daily" as const,
    is_active: true,
    current_streak: 5,
    created_at: "2026-01-01",
    updated_at: "2026-06-01",
    user_id: "user-1",
  },
  {
    id: "h2",
    title: "Read",
    color: "#00FF00",
    frequency: "weekly" as const,
    is_active: true,
    current_streak: 3,
    created_at: "2026-01-01",
    updated_at: "2026-06-01",
    user_id: "user-1",
  },
];

const mockLogs = [
  {
    id: "l1",
    habit_id: "h1",
    user_id: "user-1",
    completed_date: "2026-06-09",
    created_at: "2026-06-09",
    updated_at: "2026-06-09",
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

describe("useHabitsQuery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchActiveHabits.mockResolvedValue(mockHabits);
  });

  it("returns habits with a completed flag for each habit", async () => {
    mockFetchLogsForDate.mockResolvedValue(mockLogs);

    const { result } = renderHook(
      () => useHabitsQuery("user-1", "2026-06-09"),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const habits = result.current.data!;
    expect(habits).toHaveLength(2);

    // h1 has a log → completed: true
    expect(habits[0]).toMatchObject({ id: "h1", completed: true });
    // h2 has no log → completed: false
    expect(habits[1]).toMatchObject({ id: "h2", completed: false });
  });

  it("marks all habits as incomplete when no logs exist", async () => {
    mockFetchLogsForDate.mockResolvedValue([]);

    const { result } = renderHook(
      () => useHabitsQuery("user-1", "2026-06-09"),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const habits = result.current.data!;
    expect(habits.every((h) => h.completed === false)).toBe(true);
  });

  it("passes userId to fetchActiveHabits and fetchLogsForDate", async () => {
    mockFetchLogsForDate.mockResolvedValue([]);

    renderHook(() => useHabitsQuery("user-1", "2026-06-09"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockFetchActiveHabits).toHaveBeenCalledWith("user-1");
      expect(mockFetchLogsForDate).toHaveBeenCalledWith("user-1", "2026-06-09");
    });
  });
});
