import { deriveStatsMetrics } from '../utils/statsMetrics';
import type { HabitWithScore } from '@habits/types';

function createHabit(
  id: string,
  name: string,
  frequencyDays: number[],
  score = 0,
): HabitWithScore {
  return {
    id,
    user_id: 'user-1',
    name,
    description: null,
    category: 'productivity',
    custom_label: null,
    custom_emoji: null,
    frequency_days: frequencyDays,
    created_at: '2026-01-01T00:00:00.000Z',
    archived_at: null,
    mastery_scores: {
      habit_id: id,
      user_id: 'user-1',
      score,
      level: 'seed',
      last_calculated_date: '2026-05-12',
      updated_at: '2026-05-12T00:00:00.000Z',
    },
  };
}

function record(habitId: string, checkDate: string, status: 'completed' | 'skipped' | 'missed') {
  return { habit_id: habitId, check_date: checkDate, status };
}

describe('deriveStatsMetrics', () => {
  const today = new Date('2026-05-12T12:00:00Z');

  it('excludes non-planned days from 30-day completion', () => {
    const habit = createHabit('habit-1', 'Deep Work', [1, 3, 5], 55);
    const checkInsByHabit = {
      'habit-1': [
        record('habit-1', '2026-04-13', 'completed'),
        record('habit-1', '2026-04-15', 'completed'),
        record('habit-1', '2026-04-17', 'completed'),
        record('habit-1', '2026-04-20', 'completed'),
        record('habit-1', '2026-04-22', 'completed'),
        record('habit-1', '2026-04-24', 'completed'),
        record('habit-1', '2026-04-27', 'completed'),
        record('habit-1', '2026-04-29', 'completed'),
        record('habit-1', '2026-05-01', 'completed'),
        record('habit-1', '2026-05-04', 'completed'),
        record('habit-1', '2026-05-06', 'completed'),
        record('habit-1', '2026-05-08', 'completed'),
        record('habit-1', '2026-05-11', 'completed'),
        record('habit-1', '2026-05-12', 'completed'),
      ],
    };

    const result = deriveStatsMetrics([habit], checkInsByHabit, today);

    expect(result.completion30d.completed).toBe(13);
    expect(result.completion30d.planned).toBe(13);
    expect(result.completion30d.percent).toBe(100);
  });

  it('counts skipped days as successful completion', () => {
    const habit = createHabit('habit-1', 'Daily Journal', [1, 2, 3, 4, 5, 6, 7], 40);
    const checkInsByHabit = {
      'habit-1': [record('habit-1', '2026-05-10', 'skipped')],
    };

    const result = deriveStatsMetrics([habit], checkInsByHabit, today);

    expect(result.completion30d.completed).toBe(1);
    expect(result.completion30d.planned).toBe(30);
    expect(result.completion30d.percent).toBe(3);
  });

  it('computes weekly delta from the previous 7 days', () => {
    const habit = createHabit('habit-1', 'Mobility', [1, 2, 3, 4, 5, 6, 7], 60);
    const checkInsByHabit = {
      'habit-1': [
        record('habit-1', '2026-05-12', 'completed'),
        record('habit-1', '2026-05-11', 'completed'),
        record('habit-1', '2026-05-10', 'completed'),
        record('habit-1', '2026-05-09', 'completed'),
        record('habit-1', '2026-05-08', 'completed'),
        record('habit-1', '2026-05-07', 'completed'),
        record('habit-1', '2026-05-05', 'completed'),
        record('habit-1', '2026-04-30', 'completed'),
      ],
    };

    const result = deriveStatsMetrics([habit], checkInsByHabit, today);

    expect(result.completionCurrentWeek.percent).toBe(86);
    expect(result.completionPreviousWeek.percent).toBe(29);
    expect(result.completionDeltaVsPrevWeek).toBe(57);
  });

  it('ranks top habits by current streak, then mastery score, then name', () => {
    const habits = [
      createHabit('habit-1', 'Zeta Run', [1, 2, 3, 4, 5, 6, 7], 90),
      createHabit('habit-2', 'Alpha Read', [1, 2, 3, 4, 5, 6, 7], 90),
      createHabit('habit-3', 'Mid Lift', [1, 2, 3, 4, 5, 6, 7], 20),
      createHabit('habit-4', 'Low Stretch', [1, 2, 3, 4, 5, 6, 7], 100),
    ];

    const checkInsByHabit = {
      'habit-1': [
        record('habit-1', '2026-05-12', 'completed'),
        record('habit-1', '2026-05-11', 'completed'),
        record('habit-1', '2026-05-10', 'completed'),
        record('habit-1', '2026-05-09', 'completed'),
      ],
      'habit-2': [
        record('habit-2', '2026-05-12', 'completed'),
        record('habit-2', '2026-05-11', 'completed'),
        record('habit-2', '2026-05-10', 'completed'),
        record('habit-2', '2026-05-09', 'completed'),
      ],
      'habit-3': [
        record('habit-3', '2026-05-12', 'completed'),
        record('habit-3', '2026-05-11', 'completed'),
        record('habit-3', '2026-05-10', 'completed'),
        record('habit-3', '2026-05-09', 'completed'),
      ],
      'habit-4': [
        record('habit-4', '2026-05-12', 'completed'),
        record('habit-4', '2026-05-10', 'missed'),
      ],
    };

    const result = deriveStatsMetrics(habits, checkInsByHabit, today);

    expect(result.topHabitsByCurrentStreak.map((entry) => entry.habit.name)).toEqual([
      'Alpha Read',
      'Zeta Run',
      'Mid Lift',
    ]);
  });

  it('returns safe fallbacks when there are no habits', () => {
    const result = deriveStatsMetrics([], {}, today);

    expect(result.globalCurrentStreak).toBe(0);
    expect(result.globalBestStreak).toBe(0);
    expect(result.completion30d.percent).toBe(0);
    expect(result.completion30d.planned).toBe(0);
    expect(result.completionDeltaVsPrevWeek).toBeNull();
    expect(result.topHabitsByCurrentStreak).toEqual([]);
    expect(result.activity30dCells).toHaveLength(30);
  });
});
