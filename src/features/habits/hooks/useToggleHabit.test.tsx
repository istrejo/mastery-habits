import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useToggleHabit } from "./useToggleHabit";
import { useHabitsStore } from "../useHabitsStore";

// Mock env + supabase
jest.mock("../../../core/constants/env", () => ({
  SUPABASE_URL: "https://mock.supabase.co",
  SUPABASE_ANON_KEY: "mock-anon-key",
}));
jest.mock("../../../core/api/supabase", () => ({
  supabase: { from: jest.fn() },
}));

// Mock service functions
import * as habitsService from "../services/habitsService";
jest.mock("../services/habitsService");

const mockInsertHabitLog = habitsService.insertHabitLog as jest.Mock;
const mockDeleteHabitLog = habitsService.deleteHabitLog as jest.Mock;
const mockWriteStreak = habitsService.writeStreak as jest.Mock;

// Mock streak recompute
import * as streakRecompute from "../services/streakRecompute";
jest.mock("../services/streakRecompute");
const mockRecomputeStreak = streakRecompute.recomputeStreak as jest.Mock;

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

describe("useToggleHabit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRecomputeStreak.mockResolvedValue(7);
    useHabitsStore.getState().reset();
  });

  // ─── Uncheck → Insert ─────────────────────────────────────────────

  describe("when toggling unchecked (completing a habit)", () => {
    it("calls insertHabitLog + recomputeStreak", async () => {
      mockInsertHabitLog.mockResolvedValue({ id: "l-new" });
      mockRecomputeStreak.mockResolvedValue(8);

      const { result } = renderHook(() => useToggleHabit("user-1", "2026-06-09"), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ habitId: "h1", checked: false, frequency: "daily" });
      });

      expect(mockInsertHabitLog).toHaveBeenCalledWith("h1", "user-1", "2026-06-09");
      expect(mockRecomputeStreak).toHaveBeenCalledWith("h1", "daily");
      expect(mockDeleteHabitLog).not.toHaveBeenCalled();
    });

    it("adds habitId to pendingToggles during mutation", async () => {
      mockInsertHabitLog.mockResolvedValue({ id: "l-new" });
      mockRecomputeStreak.mockResolvedValue(8);

      const { result } = renderHook(() => useToggleHabit("user-1", "2026-06-09"), {
        wrapper: createWrapper(),
      });

      const mutatePromise = act(async () => {
        await result.current.mutateAsync({ habitId: "h1", checked: false, frequency: "daily" });
      });

      // During mutation, pendingToggles should contain h1
      expect(useHabitsStore.getState().pendingToggles.has("h1")).toBe(true);

      await mutatePromise;

      // After mutation, it should be removed
      expect(useHabitsStore.getState().pendingToggles.has("h1")).toBe(false);
    });
  });

  // ─── Checked → Delete ────────────────────────────────────────────

  describe("when toggling checked (uncompleting a habit)", () => {
    it("calls deleteHabitLog + recomputeStreak", async () => {
      mockDeleteHabitLog.mockResolvedValue(undefined);
      mockRecomputeStreak.mockResolvedValue(6);

      const { result } = renderHook(() => useToggleHabit("user-1", "2026-06-09"), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ habitId: "h1", checked: true, frequency: "daily" });
      });

      expect(mockDeleteHabitLog).toHaveBeenCalledWith("h1", "2026-06-09");
      expect(mockRecomputeStreak).toHaveBeenCalledWith("h1", "daily");
      expect(mockInsertHabitLog).not.toHaveBeenCalled();
    });
  });

  // ─── Error rollback ───────────────────────────────────────────────

  describe("when the mutation fails", () => {
    it("removes habitId from pendingToggles", async () => {
      mockDeleteHabitLog.mockRejectedValue(new Error("DB error"));

      const { result } = renderHook(() => useToggleHabit("user-1", "2026-06-09"), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ habitId: "h1", checked: true, frequency: "daily" });
        } catch {
          // expected
        }
      });

      expect(useHabitsStore.getState().pendingToggles.has("h1")).toBe(false);
    });
  });
});
