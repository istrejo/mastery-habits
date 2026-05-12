import {
  getAverageSuccessfulCheckInsPerWeek,
  getMonthlyCompletion,
  getWeeklyRhythm,
} from '../utils/habitDetailMetrics';

function makeCheckIn(
  check_date: string,
  status: 'completed' | 'skipped' | 'missed',
) {
  return { check_date, status };
}

describe('habitDetailMetrics', () => {
  describe('getWeeklyRhythm', () => {
    it('maps planned, completed, pending, missed, and rest states for the current week', () => {
      const today = new Date('2026-05-13T12:00:00Z'); // Wednesday
      const result = getWeeklyRhythm(
        [1, 3, 5],
        [
          makeCheckIn('2026-05-11', 'completed'),
          makeCheckIn('2026-05-16', 'skipped'),
        ],
        today,
      );

      expect(result.map((day) => day.status)).toEqual([
        'completed',
        'rest',
        'pending',
        'rest',
        'pending',
        'rest',
        'rest',
      ]);
      expect(result[2]?.isToday).toBe(true);
    });

    it('marks past planned days without a check-in as missed', () => {
      const today = new Date('2026-05-15T12:00:00Z'); // Friday
      const result = getWeeklyRhythm([1, 3, 5], [], today);

      expect(result[0]?.status).toBe('missed');
      expect(result[2]?.status).toBe('missed');
      expect(result[4]?.status).toBe('pending');
    });
  });

  describe('getMonthlyCompletion', () => {
    it('computes planned days and successful completion rate over the last 30 days', () => {
      const today = new Date('2026-05-15T12:00:00Z');
      const result = getMonthlyCompletion(
        [1, 3, 5],
        [
          makeCheckIn('2026-05-15', 'completed'),
          makeCheckIn('2026-05-13', 'skipped'),
          makeCheckIn('2026-05-08', 'completed'),
          makeCheckIn('2026-05-06', 'missed'),
        ],
        today,
      );

      expect(result.planned).toBeGreaterThan(0);
      expect(result.completed).toBe(3);
      expect(result.percent).toBeGreaterThan(0);
      expect(result.percent).toBeLessThan(100);
    });
  });

  describe('getAverageSuccessfulCheckInsPerWeek', () => {
    it('returns a weekly average from the last 28 days of successful check-ins', () => {
      const today = new Date('2026-05-15T12:00:00Z');
      const result = getAverageSuccessfulCheckInsPerWeek(
        [
          makeCheckIn('2026-05-15', 'completed'),
          makeCheckIn('2026-05-13', 'completed'),
          makeCheckIn('2026-05-11', 'skipped'),
          makeCheckIn('2026-05-09', 'completed'),
          makeCheckIn('2026-05-01', 'completed'),
          makeCheckIn('2026-04-10', 'completed'),
        ],
        today,
      );

      expect(result).toBe(1.3);
    });
  });
});
