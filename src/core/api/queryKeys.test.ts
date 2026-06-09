import { qk } from "./queryKeys";

describe("qk", () => {
  describe("tasks", () => {
    it("returns a [tasks, userId, date] tuple", () => {
      const key = qk.tasks("user-1", "2026-06-09");
      expect(key).toEqual(["tasks", "user-1", "2026-06-09"]);
    });

    it("produces different keys for different dates", () => {
      expect(qk.tasks("user-1", "2026-06-09")).not.toEqual(
        qk.tasks("user-1", "2026-06-10"),
      );
    });

    it("produces different keys for different users", () => {
      expect(qk.tasks("user-1", "2026-06-09")).not.toEqual(
        qk.tasks("user-2", "2026-06-09"),
      );
    });
  });

  describe("subtasks", () => {
    it("returns a [tasks, sub, parentId] tuple", () => {
      const key = qk.subtasks("task-123");
      expect(key).toEqual(["tasks", "sub", "task-123"]);
    });

    it("produces different keys for different parent ids", () => {
      expect(qk.subtasks("task-1")).not.toEqual(qk.subtasks("task-2"));
    });
  });

  describe("habits", () => {
    it("returns a [habits, userId] tuple", () => {
      const key = qk.habits("user-1");
      expect(key).toEqual(["habits", "user-1"]);
    });

    it("produces different keys for different users", () => {
      expect(qk.habits("user-1")).not.toEqual(qk.habits("user-2"));
    });
  });

  describe("habitLogs", () => {
    it("returns a [habitLogs, userId, date] tuple", () => {
      const key = qk.habitLogs("user-1", "2026-06-09");
      expect(key).toEqual(["habitLogs", "user-1", "2026-06-09"]);
    });

    it("produces different keys for different dates", () => {
      expect(qk.habitLogs("user-1", "2026-06-09")).not.toEqual(
        qk.habitLogs("user-1", "2026-06-10"),
      );
    });
  });
});
