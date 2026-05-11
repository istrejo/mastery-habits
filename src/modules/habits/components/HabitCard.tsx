/* stitch: habit-card */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@core/theming';
import { ProgressBar } from '@core/components';
import type { HabitWithScore } from '../types';
import type { MasteryLevel } from '@core/theming';
import { CategoryBadge } from './CategoryBadge';


interface HabitCardProps {
  habit: HabitWithScore;
  onPress?: () => void;
  completed?: boolean;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onPress, completed = false }) => {
  const t = useTheme();
  const score = habit.mastery_scores?.score ?? 0;
  const level = (habit.mastery_scores?.level ?? 'seed') as MasteryLevel;
  const levelTokens = t.level[level];

  const scoreColor =
    score >= 71 ? t.score.excellent
    : score >= 46 ? t.score.good
    : score >= 21 ? t.score.warning
    : t.score.critical;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: t.bg.surface,
        borderColor: t.border.default,
        borderWidth: t.borderWidth.default,
        borderRadius: t.radius.lg,
        padding: t.spacing.marginMobile,
        marginBottom: t.spacing.stackMd,
        gap: t.spacing.stackMd,
        opacity: completed ? 0.5 : 1,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.stackSm, flex: 1 }}>
          <CategoryBadge habit={habit} size="sm" showLabel={false} />
          <Text style={{
            color: t.text.primary,
            fontSize: t.typography.scale.bodyMain.fontSize,
            fontWeight: '600',
            fontFamily: 'Inter_600SemiBold',
            flex: 1,
            textDecorationLine: completed ? 'line-through' : 'none',
          }}>
            {habit.name}
          </Text>
        </View>
        <View style={{
          backgroundColor: levelTokens.bg,
          borderColor: levelTokens.border,
          borderWidth: t.borderWidth.default,
          borderRadius: t.radius.pill,
          paddingHorizontal: 10,
          paddingVertical: 3,
        }}>
          <Text style={{
            color: levelTokens.fg,
            fontSize: t.typography.scale.microBold.fontSize,
            fontWeight: '700',
            fontFamily: 'Inter_700Bold',
          }}>
            {level.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Score + compliance row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{
          color: t.text.secondary,
          fontSize: t.typography.scale.labelCaps.fontSize,
          fontWeight: '600',
          fontFamily: 'Inter_600SemiBold',
          letterSpacing: t.typography.scale.labelCaps.letterSpacing,
          textTransform: 'uppercase',
        }}>
          {`Score: ${score.toFixed(1)}`}
        </Text>
        <Text style={{
          color: scoreColor,
          fontSize: t.typography.scale.labelCaps.fontSize,
          fontWeight: '700',
          fontFamily: 'Inter_700Bold',
          fontVariant: ['tabular-nums'],
        }}>
          {`${Math.round(score)}%`}
        </Text>
      </View>

      {/* Progress */}
      <ProgressBar value={score} />

      {/* Completed overlay */}
      {completed && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: `${t.accent.primary}1A`,
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <MaterialIcons name="check" size={56} color={t.accent.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
};
