import {
  DEFAULT_CREATE_HABIT_DAYS,
  WEEKDAY_CREATE_HABIT_DAYS,
  findCreateHabitCategoryOption,
  getCreateHabitCategoryOptions,
  getDaysForFrequencyPreset,
  inferFrequencyPreset,
} from '../utils/createHabitPresets';

describe('createHabitPresets', () => {
  it('returns all domain categories for the create flow', () => {
    expect(getCreateHabitCategoryOptions().map((option) => option.categoryId)).toEqual([
      'health',
      'mind',
      'learning',
      'productivity',
      'nutrition',
      'creativity',
      'social',
      'finance',
      'custom',
    ]);
  });

  it('derives visual metadata from the real category id', () => {
    expect(findCreateHabitCategoryOption('finance')).toEqual(
      expect.objectContaining({
        categoryId: 'finance',
        labelKey: 'categories.finance.label',
        iconName: 'savings',
        emoji: '💰',
      }),
    );
  });

  it('maps frequency presets to canonical day arrays', () => {
    expect(getDaysForFrequencyPreset('daily', [1, 3, 5])).toEqual([...DEFAULT_CREATE_HABIT_DAYS]);
    expect(getDaysForFrequencyPreset('mon-fri', [1, 3, 5])).toEqual([...WEEKDAY_CREATE_HABIT_DAYS]);
    expect(getDaysForFrequencyPreset('custom', [5, 1, 3])).toEqual([1, 3, 5]);
  });

  it('infers the correct frequency preset from selected days', () => {
    expect(inferFrequencyPreset([...DEFAULT_CREATE_HABIT_DAYS])).toBe('daily');
    expect(inferFrequencyPreset([...WEEKDAY_CREATE_HABIT_DAYS])).toBe('mon-fri');
    expect(inferFrequencyPreset([1, 3, 5])).toBe('custom');
  });
});
