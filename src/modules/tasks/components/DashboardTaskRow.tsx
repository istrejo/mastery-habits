import React, { useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withSequence,
  useAnimatedStyle,
  useAnimatedProps,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@core/theming';
import type { TaskSubtask, TaskWithHabit } from '../types';

const dashboardTaskRowBase = {
  position: 'relative' as const,
  overflow: 'hidden' as const,
  paddingVertical: 16,
  paddingLeft: 12,
  paddingRight: 4,
};

const progressCircleBase = {
  width: 44,
  height: 44,
  borderWidth: 2,
  lineHeight: 40,
  fontFamily: 'Lexend_600SemiBold' as const,
  textAlign: 'center' as const,
  overflow: 'hidden' as const,
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AnimatedSubtaskRowProps {
  subtask: TaskSubtask;
  onPress: () => void;
  theme: any;
}

const AnimatedSubtaskRow: React.FC<AnimatedSubtaskRowProps> = ({
  subtask,
  onPress,
  theme,
}) => {
  const subtaskDone = subtask.status === 'completed';
  const colorAnim = useSharedValue(subtaskDone ? 1 : 0);
  const scaleAnim = useSharedValue(1);

  useEffect(() => {
    colorAnim.value = withTiming(subtaskDone ? 1 : 0, { duration: 250 });
    scaleAnim.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 }),
    );
  }, [subtaskDone, colorAnim, scaleAnim]);

  const textAnimatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      colorAnim.value,
      [0, 1],
      [theme.text.secondary, theme.text.tertiary],
    ),
  }));

  const viewAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  return (
    <Animated.View
      style={[
        viewAnimatedStyle,
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
      ]}
    >
      <Pressable
        testID={`dashboard-subtask-check-${subtask.id}`}
        onPress={onPress}
        style={({ pressed }) => [{
          width: 20,
          height: 20,
          borderRadius: theme.radius.pill,
          borderWidth: subtaskDone ? 0 : theme.borderWidth.default,
          borderColor: theme.border.default,
          backgroundColor: subtaskDone ? theme.text.primary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }, { opacity: pressed ? 0.82 : 1 }]}
      >
        {subtaskDone ? (
          <MaterialIcons name='check' size={13} color={theme.text.inverse} />
        ) : null}
      </Pressable>
      <Animated.Text
        numberOfLines={1}
        style={[
          textAnimatedStyle,
          {
            flex: 1,
            fontSize: theme.typography.scale.microBold.fontSize,
            lineHeight: theme.typography.scale.microBold.lineHeight,
            fontFamily: 'Lexend_400Regular',
            textDecorationLine: subtaskDone ? 'line-through' : 'none',
          },
        ]}
      >
        {subtask.title}
      </Animated.Text>
    </Animated.View>
  );
};

export type DashboardTaskStatus = 'completed' | 'active' | 'pending';

interface DashboardTaskRowProps {
  task: TaskWithHabit;
  status: DashboardTaskStatus;
  onPressRow?: () => void;
  onPressCheck?: () => void;
  onPressSubtask?: (subtaskId: string) => void;
  checkDisabled?: boolean;
  submitting?: boolean;
  inlineProgressPercent?: number;
}

const getSubtaskProgress = (subtasks: TaskSubtask[]) => {
  if (subtasks.length === 0) return 0;
  const completed = subtasks.filter(
    (subtask) => subtask.status === 'completed'
  ).length;
  return Math.round((completed / subtasks.length) * 100);
};

export const DashboardTaskRow: React.FC<DashboardTaskRowProps> = ({
  task,
  status,
  onPressRow,
  onPressCheck,
  onPressSubtask,
  checkDisabled = false,
  submitting = false,
}) => {
  const theme = useTheme();
  const isCompleted = status === 'completed';
  const isActive = status === 'active';
  const habitName = task.habits?.name;
  const subtasks = task.task_subtasks ?? [];
  const progressPercent = getSubtaskProgress(subtasks);
  const hasSubtasks = subtasks.length > 0;
  const metaText =
    task.description || (habitName ? `Habit: ${habitName}` : 'Standalone task');

  const scaleAnim = useSharedValue(1);
  const checkOpacity = useSharedValue(0);
  const progressAnim = useSharedValue(progressPercent);

  useEffect(() => {
    progressAnim.value = withTiming(progressPercent, { duration: 300 });
  }, [progressPercent, progressAnim]);

  useEffect(() => {
    if (isCompleted && hasSubtasks) {
      scaleAnim.value = withSequence(
        withTiming(1.2, { duration: 150 }),
        withTiming(1, { duration: 150 }),
      );
      checkOpacity.value = withTiming(1, { duration: 200 });
    } else {
      checkOpacity.value = 0;
      scaleAnim.value = 1;
    }
  }, [isCompleted, hasSubtasks, scaleAnim, checkOpacity]);

  const checkIconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
    opacity: hasSubtasks ? checkOpacity.value : 1,
  }));

  const circleAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(
      progressAnim.value,
      [0, 100],
      [75.4, 0],
    ),
  }));

  return (
    <View
      style={[
        dashboardTaskRowBase,
        {
          borderBottomWidth: theme.borderWidth.default,
          borderBottomColor: theme.border.default,
          opacity: isCompleted ? 0.72 : 1,
        },
      ]}
      testID={`dashboard-task-row-${task.id}`}
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

      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <Pressable
          onPress={onPressCheck}
          disabled={checkDisabled || submitting}
          style={({ pressed }) => [{
            width: 28,
            height: 28,
            borderRadius: theme.radius.pill,
            borderWidth: isCompleted ? 0 : hasSubtasks ? 0 : 2,
            borderColor: isActive ? theme.text.primary : theme.border.default,
            backgroundColor: isCompleted ? theme.text.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.spacing.stackSm,
            marginTop: 2,
          }, { opacity: pressed ? 0.82 : 1 }]}
          testID={`dashboard-task-row-check-${task.id}`}
        >
          {submitting ? (
            <ActivityIndicator size='small' color={theme.text.primary} />
          ) : hasSubtasks && !isCompleted ? (
            <Svg
              width={28}
              height={28}
              style={{ transform: [{ rotate: '-90deg' }] }}
            >
              <Circle
                cx={14}
                cy={14}
                r={12}
                stroke={theme.border.default}
                strokeWidth={2}
                fill='none'
              />
              <AnimatedCircle
                cx={14}
                cy={14}
                r={12}
                stroke={theme.text.primary}
                strokeWidth={2}
                fill='none'
                strokeDasharray={75.4}
                animatedProps={circleAnimatedProps}
                strokeLinecap='round'
              />
            </Svg>
          ) : isCompleted ? (
            <Animated.View style={checkIconAnimatedStyle}>
              <MaterialIcons
                name='check'
                size={16}
                color={theme.text.inverse}
              />
            </Animated.View>
          ) : null}
        </Pressable>

        <Pressable
          onPress={onPressRow}
          style={({ pressed }) => [{ flex: 1, paddingRight: theme.spacing.stackSm }, { opacity: pressed ? 0.82 : 1 }]}
          testID={`dashboard-task-row-body-${task.id}`}
        >
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.stackSm,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: theme.text.primary,
                    fontSize: theme.typography.scale.bodyMain.fontSize,
                    lineHeight: theme.typography.scale.bodyMain.lineHeight,
                    fontFamily: isActive
                      ? 'Lexend_600SemiBold'
                      : 'Lexend_500Medium',
                    textDecorationLine: isCompleted ? 'line-through' : 'none',
                  }}
                >
                  {task.title}
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
              </View>

              {subtasks.length > 0 ? (
                <Text
                  testID={`dashboard-task-progress-${task.id}`}
                  style={[
                    progressCircleBase,
                    {
                      borderRadius: theme.radius.pill,
                      borderColor:
                        progressPercent === 100
                          ? theme.text.primary
                          : theme.border.default,
                      color: theme.text.primary,
                      fontSize: theme.typography.scale.microBold.fontSize,
                    },
                  ]}
                >
                  {`${progressPercent}%`}
                </Text>
              ) : null}
            </View>

            {task.description && habitName ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: 6,
                }}
              >
                <MaterialIcons
                  name='bolt'
                  size={13}
                  color={theme.text.secondary}
                />
                <Text
                  numberOfLines={1}
                  style={{
                    color: theme.text.secondary,
                    fontSize: theme.typography.scale.microBold.fontSize,
                    lineHeight: theme.typography.scale.microBold.lineHeight,
                    fontFamily: 'Lexend_500Medium',
                  }}
                >
                  {habitName}
                </Text>
              </View>
            ) : null}

            {subtasks.length > 0 ? (
              <View style={{ marginTop: 12, gap: 8 }}>
                {subtasks.map((subtask) => (
                  <AnimatedSubtaskRow
                    key={subtask.id}
                    subtask={subtask}
                    onPress={() => onPressSubtask?.(subtask.id)}
                    theme={theme}
                  />
                ))}
              </View>
            ) : null}
          </View>
        </Pressable>

        <Pressable
          onPress={onPressRow}
          style={({ pressed }) => [{ opacity: pressed ? 0.82 : 1 }]}
          testID={`dashboard-task-row-chevron-${task.id}`}
        >
          <MaterialIcons
            name='chevron-right'
            size={20}
            color={theme.text.tertiary}
          />
        </Pressable>
      </View>
    </View>
  );
};
