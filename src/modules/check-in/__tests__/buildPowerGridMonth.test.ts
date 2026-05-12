import {
  buildPowerGridMonth,
  buildPowerGridWindow,
} from '../utils/buildPowerGridMonth';

type TestHabit = Parameters<typeof buildPowerGridMonth>[0]['habits'][number];

const DAILY_HABIT: TestHabit = {
  id: 'habit-1',
  frequency_days: [1, 2, 3, 4, 5, 6, 7],
  category: 'health' as const,
  custom_label: null,
  custom_emoji: null,
  mastery_scores: { score: 42 },
};

const HIGH_SCORE_HABIT: TestHabit = {
  id: 'habit-2',
  frequency_days: [1, 2, 3, 4, 5, 6, 7],
  category: 'learning' as const,
  custom_label: null,
  custom_emoji: null,
  mastery_scores: { score: 91 },
};

const MONDAY_HABIT: TestHabit = {
  id: 'habit-3',
  frequency_days: [1],
  category: 'mind' as const,
  custom_label: null,
  custom_emoji: null,
  mastery_scores: { score: 20 },
};

function makeCheckIn(
  habitId: string,
  check_date: string,
  status: 'completed' | 'skipped' | 'missed',
) {
  return { habit_id: habitId, check_date, status };
}

describe('buildPowerGridMonth', () => {
  it('marks a planned today with no check-in as today instead of missed', () => {
    const result = buildPowerGridMonth({
      month: new Date('2026-05-01T12:00:00Z'),
      habits: [DAILY_HABIT],
      checkIns: [],
      today: new Date('2026-05-12T12:00:00Z'),
    });

    const todayCell = result.days.find((day) => day.date === '2026-05-12');
    expect(todayCell?.state).toBe('today');
  });

  it('uses the highest-score completed habit icon when multiple habits succeed on the same day', () => {
    const result = buildPowerGridMonth({
      month: new Date('2026-05-01T12:00:00Z'),
      habits: [DAILY_HABIT, HIGH_SCORE_HABIT],
      checkIns: [
        makeCheckIn('habit-1', '2026-05-04', 'completed'),
        makeCheckIn('habit-2', '2026-05-04', 'completed'),
      ],
      today: new Date('2026-05-12T12:00:00Z'),
    });

    const targetDay = result.days.find((day) => day.date === '2026-05-04');
    expect(targetDay?.state).toBe('active');
    expect(targetDay?.icon).toBe('📚');
    expect(targetDay?.habitId).toBe('habit-2');
  });

  it('treats skipped days as active', () => {
    const result = buildPowerGridMonth({
      month: new Date('2026-05-01T12:00:00Z'),
      habits: [DAILY_HABIT],
      checkIns: [makeCheckIn('habit-1', '2026-05-03', 'skipped')],
      today: new Date('2026-05-12T12:00:00Z'),
    });

    const skippedDay = result.days.find((day) => day.date === '2026-05-03');
    expect(skippedDay?.state).toBe('active');
  });

  it('marks past planned days without success as missed', () => {
    const result = buildPowerGridMonth({
      month: new Date('2026-05-01T12:00:00Z'),
      habits: [DAILY_HABIT],
      checkIns: [],
      today: new Date('2026-05-12T12:00:00Z'),
    });

    const missedDay = result.days.find((day) => day.date === '2026-05-11');
    expect(missedDay?.state).toBe('missed');
  });

  it('excludes non-planned days from completion rate', () => {
    const result = buildPowerGridMonth({
      month: new Date('2026-05-01T12:00:00Z'),
      habits: [MONDAY_HABIT],
      checkIns: [makeCheckIn('habit-3', '2026-05-04', 'completed')],
      today: new Date('2026-05-14T12:00:00Z'),
    });

    const monday = result.days.find((day) => day.date === '2026-05-04');
    const tuesday = result.days.find((day) => day.date === '2026-05-05');

    expect(monday?.state).toBe('active');
    expect(tuesday?.state).toBe('not_planned');
    expect(result.completionRate).toBe(50);
  });

  it('marks future planned days as future', () => {
    const result = buildPowerGridMonth({
      month: new Date('2026-05-01T12:00:00Z'),
      habits: [DAILY_HABIT],
      checkIns: [],
      today: new Date('2026-05-12T12:00:00Z'),
    });

    const futureDay = result.days.find((day) => day.date === '2026-05-20');
    expect(futureDay?.state).toBe('future');
    expect(futureDay?.isFuture).toBe(true);
  });

  it('recomputes day counts and month contents when the selected month changes', () => {
    const may = buildPowerGridMonth({
      month: new Date('2026-05-01T12:00:00Z'),
      habits: [DAILY_HABIT],
      checkIns: [makeCheckIn('habit-1', '2026-05-31', 'completed')],
      today: new Date('2026-06-05T12:00:00Z'),
    });

    const june = buildPowerGridMonth({
      month: new Date('2026-06-01T12:00:00Z'),
      habits: [DAILY_HABIT],
      checkIns: [makeCheckIn('habit-1', '2026-05-31', 'completed')],
      today: new Date('2026-06-05T12:00:00Z'),
    });

    expect(may.days).toHaveLength(31);
    expect(june.days).toHaveLength(30);
    expect(may.days.find((day) => day.date === '2026-05-31')?.state).toBe(
      'active',
    );
    expect(june.days.find((day) => day.date === '2026-05-31')).toBeUndefined();
  });
});

describe('buildPowerGridWindow', () => {
  it('returns a rolling 14-day window ending on the selected date', () => {
    const result = buildPowerGridWindow({
      endDate: new Date('2026-05-12T12:00:00Z'),
      habits: [DAILY_HABIT],
      checkIns: [makeCheckIn('habit-1', '2026-05-12', 'completed')],
      today: new Date('2026-05-12T12:00:00Z'),
    });

    expect(result.days).toHaveLength(14);
    expect(result.days[0]?.date).toBe('2026-04-29');
    expect(result.days[result.days.length - 1]?.date).toBe('2026-05-12');
  });

  it('marks days from previous months so the UI can dim them', () => {
    const result = buildPowerGridWindow({
      endDate: new Date('2026-05-12T12:00:00Z'),
      habits: [DAILY_HABIT],
      checkIns: [],
      today: new Date('2026-05-12T12:00:00Z'),
    });

    expect(
      result.days.find((day) => day.date === '2026-04-29')
        ?.isOutsideReferenceMonth,
    ).toBe(true);
    expect(
      result.days.find((day) => day.date === '2026-05-12')
        ?.isOutsideReferenceMonth,
    ).toBe(false);
  });
});
