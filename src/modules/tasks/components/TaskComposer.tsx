import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@core/theming';
import { useTranslation } from 'react-i18next';
import { useTaskActions } from '../hooks/useTaskActions';

interface TaskComposerProps {
  habitId?: string;
  onCreated?: () => void;
}

export const TaskComposer: React.FC<TaskComposerProps> = ({ habitId, onCreated }) => {
  const t = useTheme();
  const { t: i18n } = useTranslation();
  const { createTask } = useTaskActions();
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    await createTask({ title: trimmed, habit_id: habitId ?? null });
    setTitle('');
    setSubmitting(false);
    onCreated?.();
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.spacing.stackSm,
        backgroundColor: t.bg.surfaceAlt,
        borderRadius: t.radius.md,
        borderWidth: t.borderWidth.hairline,
        borderColor: t.border.subtle,
        paddingHorizontal: t.spacing.stackMd,
        paddingVertical: t.spacing.stackSm,
      }}
    >
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder={i18n('tasks.composer_placeholder')}
        placeholderTextColor={t.text.tertiary}
        onSubmitEditing={handleSubmit}
        returnKeyType="done"
        style={{
          flex: 1,
          color: t.text.primary,
          fontSize: t.typography.scale.bodyMain.fontSize,
          fontFamily: 'Lexend_400Regular',
        }}
      />
      <TouchableOpacity onPress={handleSubmit} disabled={!title.trim() || submitting} activeOpacity={0.7}>
        <MaterialIcons
          name="add-circle"
          size={24}
          color={title.trim() ? t.accent.primary : t.border.default}
        />
      </TouchableOpacity>
    </View>
  );
};
