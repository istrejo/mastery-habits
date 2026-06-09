import { supabase } from "../../../core/api/supabase";

// Must import after mock is set up so the service file uses the mocked supabase
import {
  fetchTasksByDate,
  fetchSubTasks,
  insertTask,
  insertSubTask,
  toggleTask,
  deleteTask,
} from "./tasksService";

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
      "is",
    ]) {
      builder[method] = jest.fn().mockReturnValue(builder);
    }
    return builder;
  }

  return {
    supabase: {
      from: jest.fn().mockImplementation((_table: string) => {
        return createBuilder({ data: [], error: null });
      }),
    },
  };
});

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe("tasksService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── fetchTasksByDate ──────────────────────────────────────────────

  describe("fetchTasksByDate", () => {
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
        is_completed: false,
        completed_at: null,
        parent_id: null,
        priority: "medium" as const,
        frequency: "daily" as const,
        custom_days: null,
        created_at: "2026-06-02",
        updated_at: "2026-06-02",
        user_id: "user-1",
      },
    ];

    it("returns top-level tasks for userId and date", async () => {
      const mockBuilder = createBuilder({ data: mockTasks, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await fetchTasksByDate("user-1", "2026-06-09");

      expect(result).toEqual(mockTasks);
      expect(mockSupabase.from).toHaveBeenCalledWith("tasks");
      expect(mockBuilder.select).toHaveBeenCalledWith("*");
      expect(mockBuilder.eq).toHaveBeenCalledWith("user_id", "user-1");
      expect(mockBuilder.eq).toHaveBeenCalledWith("due_date", "2026-06-09");
      expect(mockBuilder.is).toHaveBeenCalledWith("parent_id", null);
      expect(mockBuilder.order).toHaveBeenCalledWith("created_at");
    });

    it("returns an empty array when no tasks exist for the date", async () => {
      const mockBuilder = createBuilder({ data: [], error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await fetchTasksByDate("user-1", "2026-06-09");

      expect(result).toEqual([]);
    });

    it("returns an empty array when the query fails", async () => {
      const mockBuilder = createBuilder({ data: null, error: { message: "DB error" } });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await fetchTasksByDate("user-1", "2026-06-09");

      expect(result).toEqual([]);
    });
  });

  // ─── fetchSubTasks ──────────────────────────────────────────────────

  describe("fetchSubTasks", () => {
    const mockSubTasks = [
      {
        id: "st1",
        title: "Sub-task 1",
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

    it("returns sub-tasks for a given parentId", async () => {
      const mockBuilder = createBuilder({ data: mockSubTasks, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await fetchSubTasks("t1");

      expect(result).toEqual(mockSubTasks);
      expect(mockSupabase.from).toHaveBeenCalledWith("tasks");
      expect(mockBuilder.select).toHaveBeenCalledWith("*");
      expect(mockBuilder.eq).toHaveBeenCalledWith("parent_id", "t1");
      expect(mockBuilder.order).toHaveBeenCalledWith("created_at");
    });

    it("returns an empty array when no sub-tasks exist", async () => {
      const mockBuilder = createBuilder({ data: [], error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await fetchSubTasks("t1");

      expect(result).toEqual([]);
    });

    it("returns an empty array when the query fails", async () => {
      const mockBuilder = createBuilder({ data: null, error: { message: "DB error" } });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await fetchSubTasks("t1");

      expect(result).toEqual([]);
    });
  });

  // ─── insertTask ─────────────────────────────────────────────────────

  describe("insertTask", () => {
    const taskInput = {
      title: "New Task",
      due_date: "2026-06-09",
      frequency: "once" as const,
      description: "A test task",
    };

    const insertedTask = {
      id: "new-1",
      title: "New Task",
      description: "A test task",
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

    it("inserts a task and returns the inserted row", async () => {
      const mockBuilder = createBuilder({ data: insertedTask, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await insertTask("user-1", taskInput);

      expect(result).toEqual(insertedTask);
      expect(mockSupabase.from).toHaveBeenCalledWith("tasks");
      expect(mockBuilder.insert).toHaveBeenCalledWith({
        title: "New Task",
        due_date: "2026-06-09",
        frequency: "once",
        description: "A test task",
        user_id: "user-1",
      });
      expect(mockBuilder.select).toHaveBeenCalled();
      expect(mockBuilder.single).toHaveBeenCalled();
    });

    it("inserts a task without optional fields", async () => {
      const minimalInput = {
        title: "Minimal Task",
        due_date: "2026-06-09",
        frequency: "daily" as const,
      };
      const inserted = { ...insertedTask, title: "Minimal Task", frequency: "daily", description: null };

      const mockBuilder = createBuilder({ data: inserted, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await insertTask("user-1", minimalInput);

      expect(result).toEqual(inserted);
      expect(mockBuilder.insert).toHaveBeenCalledWith({
        title: "Minimal Task",
        due_date: "2026-06-09",
        frequency: "daily",
        user_id: "user-1",
      });
    });

    it("inserts a task with custom_days", async () => {
      const customInput = {
        title: "Custom Task",
        due_date: "2026-06-09",
        frequency: "custom" as const,
        custom_days: [1, 3, 5],
      };
      const inserted = { ...insertedTask, title: "Custom Task", frequency: "custom", custom_days: [1, 3, 5] };

      const mockBuilder = createBuilder({ data: inserted, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await insertTask("user-1", customInput);

      expect(result).toEqual(inserted);
      expect(mockBuilder.insert).toHaveBeenCalledWith({
        title: "Custom Task",
        due_date: "2026-06-09",
        frequency: "custom",
        custom_days: [1, 3, 5],
        user_id: "user-1",
      });
    });

    it("throws when the insert fails", async () => {
      const mockBuilder = createBuilder({ data: null, error: { message: "Insert failed" } });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(insertTask("user-1", taskInput)).rejects.toThrow("Insert failed");
    });
  });

  // ─── insertSubTask ──────────────────────────────────────────────────

  describe("insertSubTask", () => {
    const parentTask = {
      id: "t1",
      title: "Parent Task",
      due_date: "2026-06-09",
      user_id: "user-1",
    };

    const insertedSubTask = {
      id: "st-new",
      title: "New Subtask",
      parent_id: "t1",
      due_date: "2026-06-09",
      is_completed: false,
      user_id: "user-1",
    };

    it("fetches parent task, then inserts sub-task with parent due_date", async () => {
      // First call: fetch parent
      const parentBuilder = createBuilder({ data: parentTask, error: null });
      // Second call: insert sub-task
      const insertBuilder = createBuilder({ data: insertedSubTask, error: null });

      (mockSupabase.from as jest.Mock)
        .mockReturnValueOnce(parentBuilder)
        .mockReturnValueOnce(insertBuilder);

      const result = await insertSubTask("t1", "user-1", "New Subtask");

      expect(result).toEqual(insertedSubTask);
      expect(mockSupabase.from).toHaveBeenCalledTimes(2);
      expect(mockSupabase.from).toHaveBeenNthCalledWith(1, "tasks");
      expect(mockSupabase.from).toHaveBeenNthCalledWith(2, "tasks");

      // Verify parent fetch
      expect(parentBuilder.select).toHaveBeenCalledWith("due_date");
      expect(parentBuilder.eq).toHaveBeenCalledWith("id", "t1");
      expect(parentBuilder.single).toHaveBeenCalled();

      // Verify sub-task insert
      expect(insertBuilder.insert).toHaveBeenCalledWith({
        title: "New Subtask",
        parent_id: "t1",
        user_id: "user-1",
        due_date: "2026-06-09",
      });
    });

    it("throws when parent fetch fails", async () => {
      const parentBuilder = createBuilder({ data: null, error: { message: "Parent not found" } });
      (mockSupabase.from as jest.Mock).mockReturnValue(parentBuilder);

      await expect(insertSubTask("t1", "user-1", "New Subtask")).rejects.toThrow(
        "Parent not found",
      );
    });

    it("throws when sub-task insert fails", async () => {
      const parentBuilder = createBuilder({ data: parentTask, error: null });
      const insertBuilder = createBuilder({ data: null, error: { message: "Insert failed" } });

      (mockSupabase.from as jest.Mock)
        .mockReturnValueOnce(parentBuilder)
        .mockReturnValueOnce(insertBuilder);

      await expect(insertSubTask("t1", "user-1", "New Subtask")).rejects.toThrow(
        "Insert failed",
      );
    });
  });

  // ─── toggleTask ─────────────────────────────────────────────────────

  describe("toggleTask", () => {
    it("sets is_completed = true and sets completed_at when completing", async () => {
      const mockBuilder = createBuilder({ data: null, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await toggleTask("t1", true);

      expect(mockSupabase.from).toHaveBeenCalledWith("tasks");
      expect(mockBuilder.update).toHaveBeenCalled();
      expect(mockBuilder.eq).toHaveBeenCalledWith("id", "t1");

      // Verify the update payload
      const updateCall = mockBuilder.update.mock.calls[0][0];
      expect(updateCall.is_completed).toBe(true);
      expect(updateCall.completed_at).toBeDefined();
      expect(updateCall.completed_at).not.toBeNull();
    });

    it("sets is_completed = false and completed_at = null when uncompleting", async () => {
      const mockBuilder = createBuilder({ data: null, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await toggleTask("t1", false);

      const updateCall = mockBuilder.update.mock.calls[0][0];
      expect(updateCall.is_completed).toBe(false);
      expect(updateCall.completed_at).toBeNull();
    });

    it("throws when the update fails", async () => {
      const mockBuilder = createBuilder({ data: null, error: { message: "Update failed" } });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(toggleTask("t1", true)).rejects.toThrow("Update failed");
    });
  });

  // ─── deleteTask ─────────────────────────────────────────────────────

  describe("deleteTask", () => {
    it("deletes task by id", async () => {
      const mockBuilder = createBuilder({ data: null, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await deleteTask("t1");

      expect(mockSupabase.from).toHaveBeenCalledWith("tasks");
      expect(mockBuilder.delete).toHaveBeenCalled();
      expect(mockBuilder.eq).toHaveBeenCalledWith("id", "t1");
    });

    it("throws when the delete fails", async () => {
      const mockBuilder = createBuilder({ data: null, error: { message: "Delete failed" } });
      (mockSupabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(deleteTask("t1")).rejects.toThrow("Delete failed");
    });
  });
});

// Helper to create a thenable builder that also tracks method calls.
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
    "is",
  ]) {
    builder[method] = jest.fn().mockReturnValue(builder);
  }
  return builder;
}
