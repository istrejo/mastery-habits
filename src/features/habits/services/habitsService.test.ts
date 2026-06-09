import { supabase } from "../../../core/api/supabase";

// Must import after mock is set up so the service file uses the mocked supabase
import {
  fetchActiveHabits,
  fetchLogsForDate,
  insertHabitLog,
  deleteHabitLog,
  writeStreak,
} from "./habitsService";

jest.mock("../../../core/api/supabase", () => {
  function createBuilder(result: { data: any; error: any }) {
    const builder: any = {
      then: (resolve: (value: any) => any) => Promise.resolve(result).then(resolve),
    };
    for (const method of [
      "select",
      "insert",
      "delete",
      "update",
      "upsert",
      "eq",
      "neq",
      "order",
      "single",
      "limit",
      "range",
    ]) {
      builder[method] = jest.fn().mockReturnValue(builder);
    }
    return builder;
  }

  return {
    supabase: {
      from: jest.fn().mockImplementation((_table: string) => {
        // Default builder — each test overrides via mockImplementationOnce
        return createBuilder({ data: [], error: null });
      }),
    },
  };
});

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe("habitsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── fetchActiveHabits ────────────────────────────────────────────

  describe("fetchActiveHabits", () => {
    it("queries habits WHERE user_id = $1 AND is_active = true", async () => {
      await fetchActiveHabits("user-1");

      expect(mockSupabase.from).toHaveBeenCalledWith("habits");
    });

    it("returns habits when the query succeeds with data", async () => {
      const mockHabits = [
        {
          id: "h1",
          title: "Exercise",
          color: "#FF0000",
          frequency: "daily",
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
          frequency: "weekly",
          is_active: true,
          current_streak: 3,
          created_at: "2026-01-01",
          updated_at: "2026-06-01",
          user_id: "user-1",
        },
      ];

      const mockBuilder = createBuilder({ data: mockHabits, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await fetchActiveHabits("user-1");

      expect(result).toEqual(mockHabits);
      expect(mockBuilder.select).toHaveBeenCalledWith("*");
      expect(mockBuilder.eq).toHaveBeenCalledWith("user_id", "user-1");
      expect(mockBuilder.eq).toHaveBeenCalledWith("is_active", true);
    });

    it("returns an empty array when no active habits exist", async () => {
      const mockBuilder = createBuilder({ data: [], error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await fetchActiveHabits("user-1");

      expect(result).toEqual([]);
    });
  });

  // ─── fetchLogsForDate ─────────────────────────────────────────────

  describe("fetchLogsForDate", () => {
    it("queries habit_logs WHERE user_id = $1 AND completed_date = $2", async () => {
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

      const mockBuilder = createBuilder({ data: mockLogs, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await fetchLogsForDate("user-1", "2026-06-09");

      expect(result).toEqual(mockLogs);
      expect(mockSupabase.from).toHaveBeenCalledWith("habit_logs");
      expect(mockBuilder.select).toHaveBeenCalledWith("*");
      expect(mockBuilder.eq).toHaveBeenCalledWith("user_id", "user-1");
      expect(mockBuilder.eq).toHaveBeenCalledWith("completed_date", "2026-06-09");
    });

    it("returns an empty array when no logs exist for the date", async () => {
      const mockBuilder = createBuilder({ data: [], error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await fetchLogsForDate("user-1", "2026-06-09");

      expect(result).toEqual([]);
    });

    it("returns an empty array when the query fails", async () => {
      const mockBuilder = createBuilder({ data: null, error: { message: "DB error" } });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await fetchLogsForDate("user-1", "2026-06-09");

      expect(result).toEqual([]);
    });
  });

  // ─── insertHabitLog ───────────────────────────────────────────────

  describe("insertHabitLog", () => {
    it("upserts with onConflict on (habit_id, completed_date)", async () => {
      const inserted = {
        id: "l1",
        habit_id: "h1",
        user_id: "user-1",
        completed_date: "2026-06-09",
        created_at: "2026-06-09",
        updated_at: "2026-06-09",
      };

      const mockBuilder = createBuilder({ data: inserted, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await insertHabitLog("h1", "user-1", "2026-06-09");

      expect(result).toEqual(inserted);
      expect(mockSupabase.from).toHaveBeenCalledWith("habit_logs");
      expect(mockBuilder.upsert).toHaveBeenCalledWith(
        { habit_id: "h1", user_id: "user-1", completed_date: "2026-06-09" },
        { onConflict: "habit_id,completed_date", ignoreDuplicates: true },
      );
      expect(mockBuilder.select).toHaveBeenCalled();
      expect(mockBuilder.single).toHaveBeenCalled();
    });

    it("returns null when the upsert fails", async () => {
      const mockBuilder = createBuilder({ data: null, error: { message: "Constraint violation" } });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await insertHabitLog("h1", "user-1", "2026-06-09");

      expect(result).toBeNull();
    });
  });

  // ─── deleteHabitLog ───────────────────────────────────────────────

  describe("deleteHabitLog", () => {
    it("deletes WHERE habit_id = $1 AND completed_date = $2", async () => {
      const mockBuilder = createBuilder({ data: null, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await deleteHabitLog("h1", "2026-06-09");

      expect(mockSupabase.from).toHaveBeenCalledWith("habit_logs");
      expect(mockBuilder.delete).toHaveBeenCalled();
      expect(mockBuilder.eq).toHaveBeenCalledWith("habit_id", "h1");
      expect(mockBuilder.eq).toHaveBeenCalledWith("completed_date", "2026-06-09");
    });

    it("throws when the delete fails", async () => {
      const mockBuilder = createBuilder({ data: null, error: { message: "Delete failed" } });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(deleteHabitLog("h1", "2026-06-09")).rejects.toThrow("Delete failed");
    });
  });

  // ─── writeStreak ──────────────────────────────────────────────────

  describe("writeStreak", () => {
    it("updates current_streak WHERE id = $1", async () => {
      const mockBuilder = createBuilder({ data: null, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await writeStreak("h1", 7);

      expect(mockSupabase.from).toHaveBeenCalledWith("habits");
      expect(mockBuilder.update).toHaveBeenCalledWith({ current_streak: 7 });
      expect(mockBuilder.eq).toHaveBeenCalledWith("id", "h1");
    });

    it("throws when the update fails", async () => {
      const mockBuilder = createBuilder({ data: null, error: { message: "Update failed" } });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(writeStreak("h1", 7)).rejects.toThrow("Update failed");
    });
  });
});

// Helper to create a thenable builder that also tracks method calls.
// Must be defined here (outside the mock factory) so tests can use it too.
function createBuilder(result: { data: any; error: any }) {
  const builder: any = {
    then: (resolve: Function) => Promise.resolve(result).then(resolve),
  };
  for (const method of [
    "select",
    "insert",
    "delete",
    "update",
    "upsert",
    "eq",
    "neq",
    "order",
    "single",
    "limit",
    "range",
  ]) {
    builder[method] = jest.fn().mockReturnValue(builder);
  }
  return builder;
}
