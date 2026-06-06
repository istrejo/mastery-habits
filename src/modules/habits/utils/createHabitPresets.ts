import { HABIT_CATEGORIES, type HabitCategoryId } from '../constants/categories';

export type CreateHabitFrequencyPreset = 'daily' | 'mon-fri' | 'custom';

export interface CreateHabitCategoryOption {
  categoryId: HabitCategoryId;
  labelKey: string;
  iconName: string;
  emoji: string;
  usesCustomFields?: boolean;
}

const CATEGORY_ICON_MAP: Record<HabitCategoryId, string> = {
  health: 'fitness-center',
  mind: 'self-improvement',
  learning: 'menu-book',
  productivity: 'bolt',
  nutrition: 'water-drop',
  creativity: 'palette',
  social: 'groups',
  finance: 'savings',
  custom: 'auto-awesome',
};

export const DEFAULT_CREATE_HABIT_CATEGORY: HabitCategoryId = 'health';
export const DEFAULT_CREATE_HABIT_DAYS = [1, 2, 3, 4, 5, 6, 7] as const;
export const WEEKDAY_CREATE_HABIT_DAYS = [1, 2, 3, 4, 5] as const;

export const getCreateHabitCategoryOptions = (): CreateHabitCategoryOption[] =>
  HABIT_CATEGORIES.map((category) => ({
    categoryId: category.id,
    labelKey: `categories.${category.id}.label`,
    iconName: CATEGORY_ICON_MAP[category.id],
    emoji: category.emoji,
    usesCustomFields: category.id === 'custom',
  }));

export const findCreateHabitCategoryOption = (
  categoryId: HabitCategoryId,
): CreateHabitCategoryOption => {
  const option = getCreateHabitCategoryOptions().find((item) => item.categoryId === categoryId);
  return option ?? getCreateHabitCategoryOptions()[0]!;
};

const sameDays = (left: readonly number[], right: readonly number[]) =>
  left.length === right.length && left.every((day, index) => day === right[index]);

export const getDaysForFrequencyPreset = (
  preset: CreateHabitFrequencyPreset,
  customDays: number[],
): number[] => {
  if (preset === 'daily') return [...DEFAULT_CREATE_HABIT_DAYS];
  if (preset === 'mon-fri') return [...WEEKDAY_CREATE_HABIT_DAYS];
  return customDays.length > 0 ? [...customDays].sort((a, b) => a - b) : [...WEEKDAY_CREATE_HABIT_DAYS];
};

export const inferFrequencyPreset = (days: number[]): CreateHabitFrequencyPreset => {
  const sortedDays = [...days].sort((a, b) => a - b);

  if (sameDays(sortedDays, DEFAULT_CREATE_HABIT_DAYS)) return 'daily';
  if (sameDays(sortedDays, WEEKDAY_CREATE_HABIT_DAYS)) return 'mon-fri';
  return 'custom';
};
