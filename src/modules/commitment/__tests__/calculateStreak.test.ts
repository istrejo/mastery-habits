import { calculateStreak } from '../utils/calculateStreak';

const DAILY_HABIT = { frequency_days: [1, 2, 3, 4, 5, 6, 7] };
const MON_WED_FRI = { frequency_days: [1, 3, 5] };

function makeCheckIn(date: string, status: 'completed' | 'skipped' | 'missed') {
  return { check_date: date, status };
}

describe('calculateStreak', () => {
  describe('empty check-ins', () => {
    it('returns 0 current and 0 best when no check-ins', () => {
      const today = new Date('2026-05-11T12:00:00Z');
      const result = calculateStreak(DAILY_HABIT, [], today);
      expect(result.current).toBe(0);
      expect(result.best).toBe(0);
    });
  });

  describe('current streak — completed consecutive', () => {
    it('counts 3 consecutive completed days', () => {
      const today = new Date('2026-05-11T12:00:00Z');
      const checkIns = [
        makeCheckIn('2026-05-10', 'completed'),
        makeCheckIn('2026-05-09', 'completed'),
        makeCheckIn('2026-05-08', 'completed'),
      ];
      const result = calculateStreak(DAILY_HABIT, checkIns, today);
      expect(result.current).toBe(3);
    });

    it('counts today if marked completed', () => {
      const today = new Date('2026-05-11T12:00:00Z');
      const checkIns = [
        makeCheckIn('2026-05-11', 'completed'),
        makeCheckIn('2026-05-10', 'completed'),
      ];
      const result = calculateStreak(DAILY_HABIT, checkIns, today);
      expect(result.current).toBe(2);
    });
  });

  describe('today unchecked does NOT break streak', () => {
    it('preserves streak when today has no check-in yet', () => {
      const today = new Date('2026-05-11T12:00:00Z');
      const checkIns = [
        makeCheckIn('2026-05-10', 'completed'),
        makeCheckIn('2026-05-09', 'completed'),
      ];
      const result = calculateStreak(DAILY_HABIT, checkIns, today);
      expect(result.current).toBe(2);
    });
  });

  describe('skip preserves streak', () => {
    it('skipped day counts toward streak (grace period)', () => {
      const today = new Date('2026-05-11T12:00:00Z');
      const checkIns = [
        makeCheckIn('2026-05-10', 'completed'),
        makeCheckIn('2026-05-09', 'skipped'),
        makeCheckIn('2026-05-08', 'completed'),
      ];
      const result = calculateStreak(DAILY_HABIT, checkIns, today);
      expect(result.current).toBe(3);
    });
  });

  describe('missed breaks streak', () => {
    it('current resets when missed day found in history', () => {
      const today = new Date('2026-05-11T12:00:00Z');
      const checkIns = [
        makeCheckIn('2026-05-10', 'completed'),
        makeCheckIn('2026-05-09', 'missed'),
        makeCheckIn('2026-05-08', 'completed'),
        makeCheckIn('2026-05-07', 'completed'),
        makeCheckIn('2026-05-06', 'completed'),
      ];
      const result = calculateStreak(DAILY_HABIT, checkIns, today);
      expect(result.current).toBe(1);
    });
  });

  describe('best streak', () => {
    it('captures historical maximum even if current is lower', () => {
      const today = new Date('2026-05-11T12:00:00Z');
      const checkIns = [
        makeCheckIn('2026-05-10', 'completed'),
        makeCheckIn('2026-05-09', 'missed'),
        makeCheckIn('2026-05-08', 'completed'),
        makeCheckIn('2026-05-07', 'completed'),
        makeCheckIn('2026-05-06', 'completed'),
        makeCheckIn('2026-05-05', 'completed'),
        makeCheckIn('2026-05-04', 'completed'),
      ];
      const result = calculateStreak(DAILY_HABIT, checkIns, today);
      expect(result.current).toBe(1);
      expect(result.best).toBe(5);
    });

    it('best >= current always', () => {
      const today = new Date('2026-05-11T12:00:00Z');
      const checkIns = [
        makeCheckIn('2026-05-10', 'completed'),
        makeCheckIn('2026-05-09', 'completed'),
      ];
      const result = calculateStreak(DAILY_HABIT, checkIns, today);
      expect(result.best).toBeGreaterThanOrEqual(result.current);
    });
  });

  describe('non-daily habit (Mon/Wed/Fri)', () => {
    it('only counts planned days', () => {
      // 2026-05-11 is Monday, 05-09 Sat (not planned), 05-08 Fri, 05-06 Wed, 05-04 Mon
      const today = new Date('2026-05-11T12:00:00Z');
      const checkIns = [
        makeCheckIn('2026-05-11', 'completed'),
        makeCheckIn('2026-05-08', 'completed'),
        makeCheckIn('2026-05-06', 'completed'),
        makeCheckIn('2026-05-04', 'completed'),
      ];
      const result = calculateStreak(MON_WED_FRI, checkIns, today);
      expect(result.current).toBe(4);
    });

    it('non-planned day in between does not break streak', () => {
      const today = new Date('2026-05-11T12:00:00Z');
      const checkIns = [
        makeCheckIn('2026-05-11', 'completed'),
        makeCheckIn('2026-05-08', 'completed'),
      ];
      const result = calculateStreak(MON_WED_FRI, checkIns, today);
      expect(result.current).toBe(2);
    });
  });
});
