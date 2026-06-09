import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useToggleTask } from "./useToggleTask";
import { useTasksStore } from "../useTasksStore";

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

const mockToggleTask = tasksService.toggleTask as jest.Mock;

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

describe("useToggleTask", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useTasksStore.getState().reset();
  });

  it("calls toggleTask with taskId and isCompleted", async () => {
    mockToggleTask.mockResolvedValue(undefined);

    const { result } = renderHook(() => useToggleTask(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ taskId: "t1", isCompleted: true });
    });

    expect(mockToggleTask).toHaveBeenCalledWith("t1", true);
  });

  it("adds taskId to pendingToggles on mutate", async () => {
    mockToggleTask.mockResolvedValue(undefined);

    const { result } = renderHook(() => useToggleTask(), {
      wrapper: createWrapper(),
    });

    const mutatePromise = act(async () => {
      await result.current.mutateAsync({ taskId: "t1", isCompleted: true });
    });

    // During mutation, pendingToggles should contain t1
    expect(useTasksStore.getState().pendingToggles.has("t1")).toBe(true);

    await mutatePromise;

    // After mutation completes, t1 should be removed
    expect(useTasksStore.getState().pendingToggles.has("t1")).toBe(false);
  });

  it("removes taskId from pendingToggles when mutation fails", async () => {
    mockToggleTask.mockRejectedValue(new Error("DB error"));

    const { result } = renderHook(() => useToggleTask(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({ taskId: "t1", isCompleted: false });
      } catch {
        // expected
      }
    });

    // After error, t1 should NOT be in pendingToggles
    expect(useTasksStore.getState().pendingToggles.has("t1")).toBe(false);
  });

  it("throws the error so the caller can handle it", async () => {
    mockToggleTask.mockRejectedValue(new Error("Network failure"));

    const { result } = renderHook(() => useToggleTask(), {
      wrapper: createWrapper(),
    });

    let caught: Error | undefined;
    await act(async () => {
      try {
        await result.current.mutateAsync({ taskId: "t1", isCompleted: true });
      } catch (e) {
        caught = e as Error;
      }
    });

    expect(caught).toBeDefined();
    expect(caught!.message).toBe("Network failure");
  });

  it("can toggle to uncomplete (isCompleted = false)", async () => {
    mockToggleTask.mockResolvedValue(undefined);

    const { result } = renderHook(() => useToggleTask(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ taskId: "t2", isCompleted: false });
    });

    expect(mockToggleTask).toHaveBeenCalledWith("t2", false);
  });
});
