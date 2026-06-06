import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@core/theming';
import { useTranslation } from 'react-i18next';
import { useHabits } from '@habits/index';
import { useTasks } from '@tasks/index';

interface PomodoroTargetPickerProps {
  selectedHabitId: string | null;
  selectedTaskId: string | null;
  onSelectHabit: (id: string | null) => void;
  onSelectTask: (id: string | null) => void;
}

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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: t.spacing.stackSm }}>
        <TouchableOpacity
          onPress={() => { onSelectHabit(null); onSelectTask(null); }}
          style={chipStyle(!selectedHabitId && !selectedTaskId)}
        >
          <Text style={chipTextStyle(!selectedHabitId && !selectedTaskId)}>
            {i18n('pomodoro.target.none')}
          </Text>
        </TouchableOpacity>

        {habits.map((habit) => (
          <TouchableOpacity
            key={habit.id}
            onPress={() => { onSelectHabit(habit.id); onSelectTask(null); }}
            style={chipStyle(selectedHabitId === habit.id)}
          >
            <Text style={chipTextStyle(selectedHabitId === habit.id)} numberOfLines={1}>
              {habit.name}
            </Text>
          </TouchableOpacity>
        ))}

        {pendingTasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            onPress={() => { onSelectTask(task.id); onSelectHabit(null); }}
            style={chipStyle(selectedTaskId === task.id)}
          >
            <Text style={chipTextStyle(selectedTaskId === task.id)} numberOfLines={1}>
              {task.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
