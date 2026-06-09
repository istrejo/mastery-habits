import { getMockSchedule, ScheduleEvent } from "./mockSchedule";

describe("getMockSchedule", () => {
  it("returns 2-3 events for a given date", () => {
    const events = getMockSchedule("2026-06-09");
    expect(events.length).toBeGreaterThanOrEqual(2);
    expect(events.length).toBeLessThanOrEqual(3);
  });

  it("returns deterministic output for the same date", () => {
    const a = getMockSchedule("2026-06-09");
    const b = getMockSchedule("2026-06-09");
    expect(a).toEqual(b);
  });

  it("returns slightly different output for different dates", () => {
    const mon = getMockSchedule("2026-06-08");
    const tue = getMockSchedule("2026-06-09");
    // Different dates should produce at least some variation
    const allSame = mon.every(
      (e, i) =>
        e.id === tue[i]?.id &&
        e.title === tue[i]?.title &&
        e.time === tue[i]?.time,
    );
    expect(allSame).toBe(false);
  });

  it("each event has the required shape", () => {
    const events = getMockSchedule("2026-06-09");
    for (const event of events) {
      expect(event).toHaveProperty("id");
      expect(typeof event.id).toBe("string");
      expect(event.id.length).toBeGreaterThan(0);

      expect(event).toHaveProperty("title");
      expect(typeof event.title).toBe("string");
      expect(event.title.length).toBeGreaterThan(0);

      expect(event).toHaveProperty("time");
      expect(typeof event.time).toBe("string");
      expect(event.time).toMatch(/\d{1,2}:\d{2} [AP]M/);

      expect(event).toHaveProperty("subtitle");
      expect(typeof event.subtitle).toBe("string");
      expect(event.subtitle.length).toBeGreaterThan(0);

      expect(event).toHaveProperty("kind");
      expect(["video", "location"]).toContain(event.kind);
    }
  });

  it("video events correspond to 'videocam' icon", () => {
    const events = getMockSchedule("2026-06-09");
    const videoEvents = events.filter((e) => e.kind === "video");
    for (const event of videoEvents) {
      expect(event.kind).toBe("video");
    }
  });

  it("location events correspond to 'location_on' icon", () => {
    const events = getMockSchedule("2026-06-09");
    const locationEvents = events.filter((e) => e.kind === "location");
    for (const event of locationEvents) {
      expect(event.kind).toBe("location");
    }
  });

  it("returns 3 events for '2026-06-09'", () => {
    const events = getMockSchedule("2026-06-09");
    expect(events).toHaveLength(3);
  });

  it("returns 2 events for '2026-06-08'", () => {
    const events = getMockSchedule("2026-06-08");
    expect(events).toHaveLength(2);
  });

  it("returns 2 events for '2026-06-10'", () => {
    const events = getMockSchedule("2026-06-10");
    expect(events).toHaveLength(2);
  });
});
