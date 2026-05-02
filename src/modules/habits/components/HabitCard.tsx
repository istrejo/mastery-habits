import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theming';
import { ProgressBar } from '@core/components';
import type { HabitWithScore } from '../types';
import type { MasteryLevel } from '@core/theming';

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

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: t.bg.surface,
        borderColor: t.border.default,
        borderWidth: t.borderWidth.hairline,
        borderRadius: t.radius.lg,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ color: t.text.primary, fontSize: 16, fontWeight: '600', flex: 1 }}>
          {habit.name}
        </Text>
        <View
          style={{
            backgroundColor: levelTokens.bg,
            borderColor: levelTokens.border,
            borderWidth: t.borderWidth.default,
            borderRadius: t.radius.pill,
            paddingHorizontal: 10,
            paddingVertical: 3,
          }}
        >
          <Text style={{ color: levelTokens.fg, fontSize: 11, fontWeight: '700' }}>
            {LEVEL_LABELS[level]}
          </Text>
        </View>
      </View>

      <ProgressBar value={score} style={{ marginBottom: 6 }} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: t.text.tertiary, fontSize: 12 }}>
          Score
        </Text>
        <Text
          style={{
            color:
              score >= 71
                ? t.score.excellent
                : score >= 46
                  ? t.score.good
                  : score >= 21
                    ? t.score.warning
                    : t.score.critical,
            fontSize: 12,
            fontWeight: '700',
            fontVariant: ['tabular-nums'],
          }}
        >
          {score.toFixed(1)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
