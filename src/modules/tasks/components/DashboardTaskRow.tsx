import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@core/theming';
import type { TaskSubtask, TaskWithHabit } from '../types';

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
  const completed = subtasks.filter((subtask) => subtask.status === 'completed').length;
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
  const metaText = task.description || (habitName ? `Habit: ${habitName}` : 'Standalone task');

  return (
    <View
      style={{
        position: 'relative',
        overflow: 'hidden',
        paddingVertical: 16,
        paddingLeft: 12,
        paddingRight: 4,
        borderBottomWidth: theme.borderWidth.default,
        borderBottomColor: theme.border.default,
        opacity: isCompleted ? 0.72 : 1,
      }}
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
        <TouchableOpacity
          onPress={onPressCheck}
          disabled={checkDisabled || submitting}
          activeOpacity={0.82}
          style={{
            width: 28,
            height: 28,
            borderRadius: theme.radius.pill,
            borderWidth: isCompleted ? 0 : 2,
            borderColor: isActive ? theme.text.primary : theme.border.default,
            backgroundColor: isCompleted ? theme.text.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.spacing.stackSm,
            marginTop: 2,
          }}
          testID={`dashboard-task-row-check-${task.id}`}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={theme.text.primary} />
          ) : isCompleted ? (
            <MaterialIcons name="check" size={16} color={theme.text.inverse} />
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPressRow}
          activeOpacity={0.82}
          style={{ flex: 1, paddingRight: theme.spacing.stackSm }}
          testID={`dashboard-task-row-body-${task.id}`}
        >
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.stackSm }}>
              <View style={{ flex: 1 }}>
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
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: theme.radius.pill,
                    borderWidth: 2,
                    borderColor: progressPercent === 100 ? theme.text.primary : theme.border.default,
                    color: theme.text.primary,
                    fontSize: theme.typography.scale.microBold.fontSize,
                    lineHeight: 40,
                    fontFamily: 'Lexend_600SemiBold',
                    textAlign: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {`${progressPercent}%`}
                </Text>
              ) : null}
            </View>

            {task.description && habitName ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                <MaterialIcons name="bolt" size={13} color={theme.text.secondary} />
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
                {subtasks.map((subtask) => {
                  const subtaskDone = subtask.status === 'completed';
                  return (
                    <View key={subtask.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <TouchableOpacity
                        testID={`dashboard-subtask-check-${subtask.id}`}
                        onPress={() => onPressSubtask?.(subtask.id)}
                        activeOpacity={0.82}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: theme.radius.pill,
                          borderWidth: subtaskDone ? 0 : theme.borderWidth.default,
                          borderColor: theme.border.default,
                          backgroundColor: subtaskDone ? theme.text.primary : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {subtaskDone ? <MaterialIcons name="check" size={13} color={theme.text.inverse} /> : null}
                      </TouchableOpacity>
                      <Text
                        numberOfLines={1}
                        style={{
                          flex: 1,
                          color: subtaskDone ? theme.text.tertiary : theme.text.secondary,
                          fontSize: theme.typography.scale.microBold.fontSize,
                          lineHeight: theme.typography.scale.microBold.lineHeight,
                          fontFamily: 'Lexend_400Regular',
                          textDecorationLine: subtaskDone ? 'line-through' : 'none',
                        }}
                      >
                        {subtask.title}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPressRow}
          activeOpacity={0.82}
          testID={`dashboard-task-row-chevron-${task.id}`}
        >
          <MaterialIcons name="chevron-right" size={20} color={theme.text.tertiary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
