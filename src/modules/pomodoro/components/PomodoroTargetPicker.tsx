import React, { useMemo } from 'react';
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

  const chipStyle = (selected: boolean) => ({
    paddingHorizontal: t.spacing.stackMd,
    paddingVertical: t.spacing.stackSm,
    borderRadius: t.radius.pill,
    borderWidth: t.borderWidth.default,
    borderColor: selected ? t.accent.primary : t.border.default,
    backgroundColor: selected ? t.accent.muted : 'transparent',
  });

  const chipTextStyle = (selected: boolean) => ({
    color: selected ? t.accent.primary : t.text.secondary,
    fontSize: t.typography.scale.microBold.fontSize,
    fontFamily: 'Lexend_500Medium',
  });

  const items: ChipItem[] = useMemo(() => {
    const list: ChipItem[] = [{ kind: 'none' }];
    for (const habit of habits) list.push({ kind: 'habit', habit });
    for (const task of pendingTasks) list.push({ kind: 'task', task });
    return list;
  }, [habits, pendingTasks]);

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
        renderItem={({ item }) => {
          if (item.kind === 'none') {
            const selected = !selectedHabitId && !selectedTaskId;
            return (
              <Pressable
                onPress={() => { onSelectHabit(null); onSelectTask(null); }}
                style={({ pressed }) => [chipStyle(selected), { opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={chipTextStyle(selected)}>
                  {i18n('pomodoro.target.none')}
                </Text>
              </Pressable>
            );
          }
          if (item.kind === 'habit') {
            const selected = selectedHabitId === item.habit.id;
            return (
              <Pressable
                onPress={() => { onSelectHabit(item.habit.id); onSelectTask(null); }}
                style={({ pressed }) => [chipStyle(selected), { opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={chipTextStyle(selected)} numberOfLines={1}>
                  {item.habit.name}
                </Text>
              </Pressable>
            );
          }
          const selected = selectedTaskId === item.task.id;
          return (
            <Pressable
              onPress={() => { onSelectTask(item.task.id); onSelectHabit(null); }}
              style={({ pressed }) => [chipStyle(selected), { opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={chipTextStyle(selected)} numberOfLines={1}>
                {item.task.title}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
};
