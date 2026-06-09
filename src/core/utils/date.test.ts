import { toDateString, todayString, getWeekDays, isSameDay } from "./date";

describe("toDateString", () => {
  it("returns YYYY-MM-DD for a given Date", () => {
    expect(toDateString(new Date("2026-06-09T10:30:00Z"))).toBe("2026-06-09");
  });

  it("formats single-digit months and days with leading zeros", () => {
    expect(toDateString(new Date("2026-01-05T00:00:00Z"))).toBe("2026-01-05");
  });

  it("handles year-end dates correctly", () => {
    expect(toDateString(new Date("2026-12-31T23:59:59Z"))).toBe("2026-12-31");
  });
});

describe("todayString", () => {
  it("matches toDateString for the current date", () => {
    const now = new Date();
    expect(todayString()).toBe(toDateString(now));
  });

  it("returns a string matching YYYY-MM-DD format", () => {
    expect(todayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("getWeekDays", () => {
  it("returns 5 days (Mon–Fri) for a given date", () => {
    const days = getWeekDays(new Date("2026-06-09T12:00:00Z")); // Tuesday
    expect(days).toHaveLength(5);
  });

  it("first day is always a Monday", () => {
    // Tuesday June 9, 2026 → Monday should be June 8
    const days = getWeekDays(new Date("2026-06-09T12:00:00Z"));
    expect(toDateString(days[0])).toBe("2026-06-08");
  });

  it("last day is always a Friday", () => {
    const days = getWeekDays(new Date("2026-06-09T12:00:00Z")); // Tuesday
    expect(toDateString(days[4])).toBe("2026-06-12");
  });

  it("when given a Monday, the Monday is the same date", () => {
    const days = getWeekDays(new Date("2026-06-08T12:00:00Z")); // Monday
    expect(toDateString(days[0])).toBe("2026-06-08");
  });

  it("when given a Friday, the Friday is the same date", () => {
    const days = getWeekDays(new Date("2026-06-12T12:00:00Z")); // Friday
    expect(toDateString(days[4])).toBe("2026-06-12");
  });
});

describe("isSameDay", () => {
  it("returns true for identical date strings", () => {
    expect(isSameDay("2026-06-09", "2026-06-09")).toBe(true);
  });

  it("returns false for different date strings", () => {
    expect(isSameDay("2026-06-09", "2026-06-10")).toBe(false);
  });
});
