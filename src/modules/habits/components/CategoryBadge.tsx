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
  sm: { paddingH: 6,  paddingV: 2, emojiSize: 11 },
  md: { paddingH: 10, paddingV: 4, emojiSize: 13 },
  lg: { paddingH: 14, paddingV: 6, emojiSize: 16 },
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
        <Text style={{
          color: colors.fg,
          fontSize: theme.typography.scale.labelCaps.fontSize,
          fontWeight: '600',
          fontFamily: 'Inter_600SemiBold',
          letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
          textTransform: 'uppercase',
        }}>
          {label}
        </Text>
      )}
    </View>
  );
};
