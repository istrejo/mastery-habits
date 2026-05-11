/* stitch: habit-card */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theming';
import { ProgressBar } from '@core/components';
import type { HabitWithScore } from '../types';
import type { MasteryLevel } from '@core/theming';
import { CategoryBadge } from './CategoryBadge';

const LEVEL_LABELS: Record<MasteryLevel, string> = {
  seed: '🌱 Seed',
  sprout: '🌿 Sprout',
  tree: '🌳 Tree',
  forest: '🌲 Forest',
  ancient: '🗿 Ancient',
};

interface HabitCardProps {
  habit: HabitWithScore;
  onPress?: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onPress }) => {
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
      style={{
        backgroundColor: t.bg.surface,
        borderColor: t.border.default,
        borderWidth: t.borderWidth.default,
        borderRadius: t.radius.lg,
        padding: t.spacing.marginMobile,
        marginBottom: t.spacing.stackMd,
        gap: t.spacing.stackMd,
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
            {LEVEL_LABELS[level]}
          </Text>
        </View>
      </View>

      {/* Progress */}
      <ProgressBar value={score} />

      {/* Score footer */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{
          color: t.text.secondary,
          fontSize: t.typography.scale.labelCaps.fontSize,
          fontWeight: '600',
          fontFamily: 'Inter_600SemiBold',
          letterSpacing: t.typography.scale.labelCaps.letterSpacing,
          textTransform: 'uppercase',
        }}>
          Score
        </Text>
        <Text style={{
          color: scoreColor,
          fontSize: t.typography.scale.labelCaps.fontSize,
          fontWeight: '700',
          fontFamily: 'Inter_700Bold',
          fontVariant: ['tabular-nums'],
        }}>
          {score.toFixed(1)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
