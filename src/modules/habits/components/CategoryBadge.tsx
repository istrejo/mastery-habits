/* stitch: category-badge */
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
  sm: { paddingH: 6,  paddingV: 3, emojiSize: 11 },
  md: { paddingH: 10, paddingV: 5, emojiSize: 13 },
  lg: { paddingH: 14, paddingV: 7, emojiSize: 16 },
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ habit, size = 'md', showLabel = true }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { emoji } = resolveCategory(habit);
  const s = SIZE_MAP[size];

  const label = habit.category === 'custom'
    ? (habit.custom_label ?? 'Custom')
    : t(`categories.${habit.category}.label` as any);

  return (
    <View
      style={[
        badgeRowBase,
        {
          backgroundColor: theme.accent.muted,
          borderColor: theme.border.default,
          borderWidth: theme.borderWidth.default,
          borderRadius: showLabel ? theme.radius.sm : theme.radius.pill,
          paddingHorizontal: s.paddingH,
          paddingVertical: s.paddingV,
          gap: showLabel ? 4 : 0,
        },
      ]}
    >
      <Text style={{ fontSize: s.emojiSize }}>{emoji}</Text>
      {showLabel && (
        <Text style={{
          color: theme.text.primary,
          fontSize: theme.typography.scale.microBold.fontSize,
          fontWeight: '500',
          fontFamily: 'Lexend_500Medium',
          letterSpacing: theme.typography.scale.microBold.letterSpacing,
          textTransform: 'uppercase',
        }}>
          {label}
        </Text>
      )}
    </View>
  );
};
