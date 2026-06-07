import React, { useCallback } from 'react';
import { FlatList, View, Text } from 'react-native';
import { useTheme } from '@core/theming';
import { useTranslation } from 'react-i18next';
import { TaskRow } from './TaskRow';
import type { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onToggle?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onToggle, onDelete }) => {
  const t = useTheme();
  const { t: i18n } = useTranslation();

  const renderItem = useCallback(
    ({ item }: { item: Task }) => (
      <TaskRow task={item} onToggle={onToggle} onDelete={onDelete} />
    ),
    [onToggle, onDelete],
  );

  if (tasks.length === 0) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: t.spacing.stackLg }}>
        <Text style={{ color: t.text.tertiary, fontSize: t.typography.scale.bodyMain.fontSize }}>
          {i18n('tasks.empty_title')}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      scrollEnabled={false}
    />
  );
};
