import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@core/theming';
import { useTranslation } from 'react-i18next';
import { isOverdue } from '../utils/isOverdue';
import type { Task } from '../types';

interface TaskRowProps {
  task: Task;
  onToggle?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({ task, onToggle, onDelete }) => {
  const t = useTheme();
  const { t: i18n } = useTranslation();
  const done = task.status === 'completed';
  const overdue = isOverdue(task);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.spacing.stackSm,
        paddingVertical: t.spacing.stackSm,
        borderBottomColor: t.border.subtle,
        borderBottomWidth: t.borderWidth.hairline,
      }}
    >
      <Pressable
        onPress={() => onToggle?.(task)}
        style={({ pressed }) => [{
          width: 22,
          height: 22,
          borderRadius: t.radius.sm,
          borderWidth: t.borderWidth.default,
          borderColor: done ? t.status.success : t.border.default,
          backgroundColor: done ? t.status.success : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }, { opacity: pressed ? 0.7 : 1 }]}
      >
        {done && <MaterialIcons name="check" size={14} color={t.text.inverse} />}
      </Pressable>

      <View style={{ flex: 1, gap: 2 }}>
        <Text
          numberOfLines={2}
          style={{
            color: done ? t.text.tertiary : t.text.primary,
            fontSize: t.typography.scale.bodyMain.fontSize,
            lineHeight: t.typography.scale.bodyMain.lineHeight,
            fontFamily: 'Lexend_400Regular',
            textDecorationLine: done ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </Text>
        {overdue && (
          <Text
            style={{
              color: t.status.danger,
              fontSize: t.typography.scale.microBold.fontSize,
              fontFamily: 'Lexend_500Medium',
            }}
          >
            {i18n('tasks.row.overdue')}
          </Text>
        )}
      </View>

      {onDelete && (
        <Pressable onPress={() => onDelete(task)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
          <MaterialIcons name="close" size={16} color={t.text.tertiary} />
        </Pressable>
      )}
    </View>
  );
};
