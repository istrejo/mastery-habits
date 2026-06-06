import { computeRemaining } from '../utils/computeRemaining';

const PLANNED = 1500; // 25 min

describe('computeRemaining', () => {
  it('returns plannedDuration when startedAt is null', () => {
    expect(computeRemaining(null, PLANNED, 0)).toBe(PLANNED);
  });

  it('computes remaining for running timer', () => {
    const now = 1000000;
    const startedAt = now - 60_000; // started 60s ago
    const result = computeRemaining(startedAt, PLANNED, 0, now);
    expect(result).toBeCloseTo(PLANNED - 60, 5);
  });

  it('subtracts paused time from elapsed', () => {
    const now = 1000000;
    const startedAt = now - 120_000; // 120s elapsed
    const pausedAccumMs = 60_000;    // 60s was paused
    const result = computeRemaining(startedAt, PLANNED, pausedAccumMs, now);
    expect(result).toBeCloseTo(PLANNED - 60, 5); // only 60s actual work
  });

  it('returns 0 when elapsed > planned', () => {
    const now = 1000000;
    const startedAt = now - (PLANNED + 60) * 1000; // over time
    expect(computeRemaining(startedAt, PLANNED, 0, now)).toBe(0);
  });
});
