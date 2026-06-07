import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ProgressBar } from '@core/components';
import { useTheme } from '@core/theming';
import type { HabitWithScore } from '../types';
import { resolveCategory } from '../utils/resolveCategory';

const dashboardHabitRowBase = {
  position: 'relative' as const,
  overflow: 'hidden' as const,
  paddingVertical: 16,
  paddingLeft: 12,
  paddingRight: 4,
};

const habitCheckCircleBase = {
  width: 28,
  height: 28,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

export type DashboardHabitStatus = 'completed' | 'active' | 'pending';

interface DashboardHabitRowProps {
  habit: HabitWithScore;
  status: DashboardHabitStatus;
  score?: number;
  onPressRow?: () => void;
  onPressCheck?: () => void;
  checkDisabled?: boolean;
  submitting?: boolean;
  inlineProgressPercent?: number;
}

export const DashboardHabitRow: React.FC<DashboardHabitRowProps> = ({
  habit,
  status,
  score = habit.mastery_scores?.score ?? 0,
  onPressRow,
  onPressCheck,
  checkDisabled = false,
  submitting = false,
  inlineProgressPercent,
}) => {
  const theme = useTheme();
  const { label } = resolveCategory(habit);

  const isCompleted = status === 'completed';
  const isActive = status === 'active';
  const metaText = habit.description || label;
  const displayProgress = inlineProgressPercent ?? 30;

  return (
    <View
      style={[
        dashboardHabitRowBase,
        {
          borderBottomWidth: theme.borderWidth.default,
          borderBottomColor: theme.border.default,
          opacity: isCompleted ? 0.72 : 1,
        },
      ]}
      testID={`dashboard-habit-row-${habit.id}`}
    >
      {isActive ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            backgroundColor: theme.text.primary,
          }}
        />
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Pressable
          onPress={onPressCheck}
          disabled={checkDisabled || submitting}
          style={({ pressed }) => [
            habitCheckCircleBase,
            {
              borderRadius: theme.radius.pill,
              borderWidth: isCompleted ? 0 : 2,
              borderColor: isActive ? theme.text.primary : theme.border.default,
              backgroundColor: isCompleted ? theme.text.primary : 'transparent',
              marginRight: theme.spacing.stackSm,
            },
            { opacity: pressed ? 0.82 : 1 },
          ]}
          testID={`dashboard-habit-row-check-${habit.id}`}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={theme.text.primary} />
          ) : isCompleted ? (
            <MaterialIcons name="check" size={16} color={theme.text.inverse} />
          ) : null}
        </Pressable>

        <Pressable
          onPress={onPressRow}
          style={({ pressed }) => [{ flex: 1, paddingRight: theme.spacing.stackSm }, { opacity: pressed ? 0.82 : 1 }]}
          testID={`dashboard-habit-row-body-${habit.id}`}
        >
          <View>
            <Text
              numberOfLines={1}
              style={{
                color: theme.text.primary,
                fontSize: theme.typography.scale.bodyMain.fontSize,
                lineHeight: theme.typography.scale.bodyMain.lineHeight,
                fontFamily: isActive ? 'Lexend_600SemiBold' : 'Lexend_500Medium',
                textDecorationLine: isCompleted ? 'line-through' : 'none',
              }}
            >
              {habit.name}
            </Text>

            <Text
              numberOfLines={1}
              style={{
                color: theme.text.secondary,
                fontSize: theme.typography.scale.microBold.fontSize,
                lineHeight: theme.typography.scale.microBold.lineHeight,
                fontFamily: 'Lexend_400Regular',
                marginTop: 2,
              }}
            >
              {metaText}
            </Text>

            {isActive ? (
              <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: 170 }}>
                <ProgressBar
                  value={displayProgress}
                  max={100}
                  height={8}
                  style={{ flex: 1, backgroundColor: theme.accent.muted }}
                />
                <Text
                  style={{
                    color: theme.text.primary,
                    fontSize: theme.typography.scale.microBold.fontSize,
                    lineHeight: theme.typography.scale.microBold.lineHeight,
                    fontFamily: 'Lexend_500Medium',
                  }}
                >
                  {displayProgress}%
                </Text>
              </View>
            ) : null}
          </View>
          </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialIcons
              name='local-fire-department'
              size={16}
              color={isCompleted ? theme.text.primary : isActive ? theme.text.primary : theme.text.secondary}
            />
            <Text
              style={{
                color: isCompleted ? theme.text.primary : isActive ? theme.text.primary : theme.text.secondary,
                fontSize: theme.typography.scale.labelCaps.fontSize,
                lineHeight: theme.typography.scale.labelCaps.lineHeight,
                fontFamily: 'Lexend_600SemiBold',
              }}
            >
              {Math.round(score)}
            </Text>
          </View>

          <Pressable
            onPress={onPressRow}
            style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}
            testID={`dashboard-habit-row-chevron-${habit.id}`}
          >
            <MaterialIcons name="chevron-right" size={20} color={theme.text.tertiary} />
        </Pressable>
        </View>
      </View>
    </View>
  );
};
