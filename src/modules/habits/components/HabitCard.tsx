/* stitch: habit-card */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@core/theming';
import { ProgressBar } from '@core/components';
import type { HabitWithScore } from '../types';
import { CategoryBadge } from './CategoryBadge';
import { resolveCategory } from '../utils/resolveCategory';

interface HabitCardProps {
  habit: HabitWithScore;
  onPress?: () => void;
  completed?: boolean;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onPress, completed = false }) => {
  const t = useTheme();
  const score = habit.mastery_scores?.score ?? 0;
  const { label } = resolveCategory(habit);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={{
        backgroundColor: t.bg.surface,
        borderColor: t.border.default,
        borderWidth: t.borderWidth.default,
        borderRadius: t.radius.lg,
        padding: t.spacing.marginMobile,
        marginBottom: t.spacing.stackSm,
        gap: t.spacing.stackMd,
        opacity: completed ? 0.58 : 1,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.stackSm }}>
        <View style={{
          width: 22,
          height: 22,
          borderRadius: t.radius.pill,
          borderWidth: t.borderWidth.default,
          borderColor: completed ? t.accent.primary : t.border.default,
          backgroundColor: completed ? t.accent.primary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {completed && <MaterialIcons name="check" size={14} color={t.accent.onPrimary} />}
        </View>

        <View style={{ flex: 1, gap: 3 }}>
          <Text
            numberOfLines={1}
            style={{
              color: t.text.primary,
              fontSize: t.typography.scale.bodyMain.fontSize,
              lineHeight: t.typography.scale.bodyMain.lineHeight,
              fontFamily: 'Lexend_500Medium',
              textDecorationLine: completed ? 'line-through' : 'none',
            }}
          >
            {habit.name}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              color: t.text.secondary,
              fontSize: t.typography.scale.microBold.fontSize,
              lineHeight: t.typography.scale.microBold.lineHeight,
              fontFamily: 'Lexend_400Regular',
            }}
          >
            {habit.description || label}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={{ color: t.text.primary, fontSize: 12, fontFamily: 'Lexend_600SemiBold' }}>
            🔥 {Math.round(score)}
          </Text>
          <MaterialIcons name="chevron-right" size={20} color={t.text.tertiary} />
        </View>
      </View>

      <View style={{ gap: t.spacing.stackSm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <CategoryBadge habit={habit} size="sm" showLabel />
          <Text style={{
            color: t.text.secondary,
            fontSize: t.typography.scale.microBold.fontSize,
            fontFamily: 'Lexend_500Medium',
            fontVariant: ['tabular-nums'],
          }}>
            {score.toFixed(1)} / 100
          </Text>
        </View>
        <ProgressBar value={score} />
      </View>

      {completed && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(17, 17, 17, 0.04)',
          pointerEvents: 'none',
        }} />
      )}
    </TouchableOpacity>
  );
};
