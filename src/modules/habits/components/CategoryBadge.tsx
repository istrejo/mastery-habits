import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@core/theming';
import { useTranslation } from 'react-i18next';
import { resolveCategory } from '../utils/resolveCategory';
import type { Habit } from '../types';

interface CategoryBadgeProps {
  habit: Pick<Habit, 'category' | 'custom_label' | 'custom_emoji'>;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const SIZE_MAP = {
  sm: { fontSize: 10, paddingH: 6,  paddingV: 2, emojiSize: 11 },
  md: { fontSize: 12, paddingH: 10, paddingV: 4, emojiSize: 13 },
  lg: { fontSize: 14, paddingH: 14, paddingV: 6, emojiSize: 16 },
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  habit,
  size = 'md',
  showLabel = true,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { emoji, colorToken } = resolveCategory(habit);
  const colors = theme.categoryColors[colorToken];
  const s = SIZE_MAP[size];

  // Custom categories use the user-defined label; predefined use i18n
  const label = habit.category === 'custom'
    ? (habit.custom_label ?? '✨')
    : t(`categories.${habit.category}.label` as any);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: colors.bg,
        borderColor: colors.border,
        borderWidth: theme.borderWidth.default,
        borderRadius: theme.radius.pill,
        paddingHorizontal: s.paddingH,
        paddingVertical: s.paddingV,
        gap: showLabel ? 4 : 0,
      }}
    >
      <Text style={{ fontSize: s.emojiSize }}>{emoji}</Text>
      {showLabel && (
        <Text style={{ color: colors.fg, fontSize: s.fontSize, fontWeight: '600' }}>
          {label}
        </Text>
      )}
    </View>
  );
};
