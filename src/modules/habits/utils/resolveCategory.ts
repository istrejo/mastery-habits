import type { CategoryColorToken } from '@core/theming';
import { getCategoryDef, type HabitCategoryId } from '../constants/categories';
import type { Habit } from '../types';

export interface ResolvedCategory {
  label: string;
  emoji: string;
  colorToken: CategoryColorToken;
}

export const resolveCategory = (habit: Pick<Habit, 'category' | 'custom_label' | 'custom_emoji'>): ResolvedCategory => {
  const id = habit.category as HabitCategoryId;
  const def = getCategoryDef(id);
  const customDef = getCategoryDef('custom')!;

  // Unknown/null category (unmigrated remote data) or explicit custom → treat as custom
  if (!def || habit.category === 'custom') {
    return {
      label: habit.custom_label ?? customDef.label,
      emoji: habit.custom_emoji ?? customDef.emoji,
      colorToken: customDef.colorToken,
    };
  }

  return { label: def.label, emoji: def.emoji, colorToken: def.colorToken };
};
