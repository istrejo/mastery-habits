import { recomputeStreak } from "./streakRecompute";
import * as habitsService from "./habitsService";

// Mock env before supabase module loads
jest.mock("../../../core/constants/env", () => ({
  SUPABASE_URL: "https://mock.supabase.co",
  SUPABASE_ANON_KEY: "mock-anon-key",
}));

// Must provide a factory — auto-mock executes the real module body which calls createClient()
jest.mock("../../../core/api/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));
jest.mock("./habitsService");

import { supabase } from "../../../core/api/supabase";

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

function createBuilder(result: { data: any; error: any }) {
  const builder: any = {
    then: (resolve: Function) => Promise.resolve(result).then(resolve),
  };
  for (const method of ["select", "order", "eq", "single", "limit"]) {
    builder[method] = jest.fn().mockReturnValue(builder);
  }
  return builder;
}

describe("recomputeStreak", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: no logs
    const mockBuilder = createBuilder({ data: [], error: null });
    (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);
  });

  // ─── Daily frequency ──────────────────────────────────────────────

  describe("daily frequency", () => {
    it("returns 0 when there are no logs at all", async () => {
      const streak = await recomputeStreak("h1", "daily");
      expect(streak).toBe(0);
    });

    it("returns 1 when there is exactly today's log", async () => {
      const today = new Date().toISOString().slice(0, 10);
      const mockBuilder = createBuilder({
        data: [{ completed_date: today }],
        error: null,
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const streak = await recomputeStreak("h1", "daily");

      expect(streak).toBe(1);
    });

    it("returns a streak of consecutive days counting back from today", async () => {
      const today = new Date().toISOString().slice(0, 10);
      // Compute yesterday and day-before-yesterday strings
      const d = new Date();
      const yesterday = new Date(d);
      yesterday.setDate(d.getDate() - 1);
      const dayBefore = new Date(d);
      dayBefore.setDate(d.getDate() - 2);
      const yStr = yesterday.toISOString().slice(0, 10);
      const dbStr = dayBefore.toISOString().slice(0, 10);

      // Logs ordered DESC: today, yesterday, day-before
      const mockBuilder = createBuilder({
        data: [
          { completed_date: today },
          { completed_date: yStr },
          { completed_date: dbStr },
        ],
        error: null,
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const streak = await recomputeStreak("h1", "daily");

      expect(streak).toBe(3);
    });

    it("stops at the first gap in consecutive days", async () => {
      const today = new Date().toISOString().slice(0, 10);
      const d = new Date();
      const yesterday = new Date(d);
      yesterday.setDate(d.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);
      // day-before-yesterday is MISSING — gap
      const threeDaysAgo = new Date(d);
      threeDaysAgo.setDate(d.getDate() - 3);
      const tdaStr = threeDaysAgo.toISOString().slice(0, 10);

      const mockBuilder = createBuilder({
        data: [
          { completed_date: today },
          { completed_date: yStr },
          { completed_date: tdaStr }, // gap between yesterday and 3-days-ago
        ],
        error: null,
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const streak = await recomputeStreak("h1", "daily");

      // Should stop at the gap: only today + yesterday = 2
      expect(streak).toBe(2);
    });

    it("returns 0 when today is not logged but yesterday is", async () => {
      const d = new Date();
      const yesterday = new Date(d);
      yesterday.setDate(d.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);

      const mockBuilder = createBuilder({
        data: [{ completed_date: yStr }],
        error: null,
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const streak = await recomputeStreak("h1", "daily");

      // Streak always starts from today — if today has no log, streak is 0
      expect(streak).toBe(0);
    });
  });

  // ─── Weekly frequency ─────────────────────────────────────────────

  describe("weekly frequency", () => {
    it("returns 1 when there is a log within the current week", async () => {
      const today = new Date().toISOString().slice(0, 10);
      const mockBuilder = createBuilder({
        data: [{ completed_date: today }],
        error: null,
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const streak = await recomputeStreak("h1", "weekly");

      // Simplified: if there's a log this week → streak = 1
      expect(streak).toBe(1);
    });

    it("returns 0 when no log exists in the current week", async () => {
      // A date far in the past — not in current week
      const mockBuilder = createBuilder({
        data: [{ completed_date: "2025-01-15" }],
        error: null,
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const streak = await recomputeStreak("h1", "weekly");

      expect(streak).toBe(0);
    });
  });

  // ─── writeStreak call ─────────────────────────────────────────────

  it("calls writeStreak with the computed streak value", async () => {
    const writeStreakSpy = jest
      .spyOn(habitsService, "writeStreak")
      .mockResolvedValue(undefined);

    const today = new Date().toISOString().slice(0, 10);
    const mockBuilder = createBuilder({
      data: [{ completed_date: today }],
      error: null,
    });
    (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

    await recomputeStreak("h1", "daily");

    expect(writeStreakSpy).toHaveBeenCalledWith("h1", 1);
  });

  // ─── Query structure ──────────────────────────────────────────────

  it("queries habit_logs ordered by completed_date DESC", async () => {
    const today = new Date().toISOString().slice(0, 10);
    const mockBuilder = createBuilder({
      data: [{ completed_date: today }],
      error: null,
    });
    (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

    await recomputeStreak("h1", "daily");

    expect(mockSupabase.from).toHaveBeenCalledWith("habit_logs");
    expect(mockBuilder.select).toHaveBeenCalledWith("completed_date");
    expect(mockBuilder.eq).toHaveBeenCalledWith("habit_id", "h1");
    expect(mockBuilder.order).toHaveBeenCalledWith("completed_date", {
      ascending: false,
    });
  });
});
