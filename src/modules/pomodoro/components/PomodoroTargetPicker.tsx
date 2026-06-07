import React, { useCallback, useMemo } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { useTheme } from '@core/theming';
import { useTranslation } from 'react-i18next';
import { useHabits } from '@habits/index';
import { useTasks } from '@tasks/index';
import type { Habit } from '@habits/types';
import type { Task } from '@tasks/types';

interface PomodoroTargetPickerProps {
  selectedHabitId: string | null;
  selectedTaskId: string | null;
  onSelectHabit: (id: string | null) => void;
  onSelectTask: (id: string | null) => void;
}

type ChipItem =
  | { kind: 'none' }
  | { kind: 'habit'; habit: Habit }
  | { kind: 'task'; task: Task };

type RowItemProps = {
  item: ChipItem;
  selected?: boolean;
  noneLabel: string;
  onPressNone: () => void;
  onPressHabit: (habitId: string) => void;
  onPressTask: (taskId: string) => void;
};

const RowItem = React.memo(function RowItem({
  item,
  selected = false,
  noneLabel,
  onPressNone,
  onPressHabit,
  onPressTask,
}: RowItemProps) {
  const t = useTheme();

  const chipDynamic = {
    paddingHorizontal: t.spacing.stackMd,
    paddingVertical: t.spacing.stackSm,
    borderRadius: t.radius.pill,
    borderWidth: t.borderWidth.default,
    borderColor: selected ? t.accent.primary : t.border.default,
    backgroundColor: selected ? t.accent.muted : 'transparent',
  };

  const textDynamic = {
    color: selected ? t.accent.primary : t.text.secondary,
    fontSize: t.typography.scale.microBold.fontSize,
    fontFamily: 'Lexend_500Medium',
  };

  if (item.kind === 'none') {
    return (
      <Pressable
        onPress={onPressNone}
        style={({ pressed }) => [chipDynamic, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Text style={textDynamic}>{noneLabel}</Text>
      </Pressable>
    );
  }
  if (item.kind === 'habit') {
    return (
      <Pressable
        onPress={() => onPressHabit(item.habit.id)}
        style={({ pressed }) => [chipDynamic, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Text style={textDynamic} numberOfLines={1}>
          {item.habit.name}
        </Text>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={() => onPressTask(item.task.id)}
      style={({ pressed }) => [chipDynamic, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Text style={textDynamic} numberOfLines={1}>
        {item.task.title}
      </Text>
    </Pressable>
  );
});

export const PomodoroTargetPicker: React.FC<PomodoroTargetPickerProps> = ({
  selectedHabitId,
  selectedTaskId,
  onSelectHabit,
  onSelectTask,
}) => {
  const t = useTheme();
  const { t: i18n } = useTranslation();
  const { habits } = useHabits();
  const { tasks } = useTasks();
  const pendingTasks = tasks.filter((task) => task.status === 'pending');

  const items: ChipItem[] = useMemo(() => {
    const list: ChipItem[] = [{ kind: 'none' }];
    for (const habit of habits) list.push({ kind: 'habit', habit });
    for (const task of pendingTasks) list.push({ kind: 'task', task });
    return list;
  }, [habits, pendingTasks]);

  const handleSelectNone = useCallback(() => {
    onSelectHabit(null);
    onSelectTask(null);
  }, [onSelectHabit, onSelectTask]);

  const handleSelectHabit = useCallback((habitId: string) => {
    onSelectHabit(habitId);
    onSelectTask(null);
  }, [onSelectHabit, onSelectTask]);

  const handleSelectTask = useCallback((taskId: string) => {
    onSelectTask(taskId);
    onSelectHabit(null);
  }, [onSelectHabit, onSelectTask]);

  const noneLabelMemo = useMemo(() => i18n('pomodoro.target.none'), [i18n]);

  return (
    <View style={{ gap: t.spacing.stackSm }}>
      <Text
        style={{
          color: t.text.secondary,
          fontSize: t.typography.scale.labelCaps.fontSize,
          fontFamily: 'Lexend_600SemiBold',
          letterSpacing: t.typography.scale.labelCaps.letterSpacing,
          textTransform: 'uppercase',
        }}
      >
        {i18n('pomodoro.target.section_label')}
      </Text>

      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) =>
          item.kind === 'habit' ? `h-${item.habit.id}` : item.kind === 'task' ? `t-${item.task.id}` : 'none'
        }
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: t.spacing.stackSm }}
        renderItem={useCallback(
          ({ item }: { item: ChipItem }) => {
            const isSelected =
              item.kind === 'none'
                ? !selectedHabitId && !selectedTaskId
                : item.kind === 'habit'
                ? selectedHabitId === item.habit.id
                : selectedTaskId === item.task.id;

            return (
              <RowItem
                item={item}
                selected={isSelected}
                noneLabel={noneLabelMemo}
                onPressNone={handleSelectNone}
                onPressHabit={handleSelectHabit}
                onPressTask={handleSelectTask}
              />
            );
          },
          [selectedHabitId, selectedTaskId, noneLabelMemo, handleSelectNone, handleSelectHabit, handleSelectTask]
        )}
      />
    </View>
  );
};
