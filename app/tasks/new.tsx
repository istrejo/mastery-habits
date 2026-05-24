import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Screen } from '@core/components';
import { useTheme } from '@core/theming';
import { TaskForm } from '@tasks/index';
import { useTaskActions } from '@tasks/index';
import type { TaskFormValues } from '@tasks/utils/taskValidationSchema';

export default function NewTaskScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { createTask } = useTaskActions();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: TaskFormValues) => {
    setSubmitting(true);
    const task = await createTask({
      title: values.title,
      description: values.description ?? null,
      due_date: values.due_date ?? null,
      habit_id: values.habit_id ?? null,
    });
    setSubmitting(false);
    if (task) router.back();
  };

  return (
    <Screen
      style={{ flex: 1 }}
      contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
    >
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingHorizontal: theme.spacing.marginMobile,
            paddingTop: theme.spacing.stackSm,
            paddingBottom: theme.spacing.stackSm,
            borderBottomWidth: theme.borderWidth.default,
            borderBottomColor: theme.border.default,
            backgroundColor: theme.bg.base,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
          >
            <MaterialIcons name="close" size={22} color={theme.text.primary} />
          </TouchableOpacity>
          <Text
            style={{
              color: theme.text.primary,
              fontSize: theme.typography.scale.labelCaps.fontSize,
              fontFamily: 'Lexend_600SemiBold',
              letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
              textTransform: 'uppercase',
            }}
          >
            {t('tasks.new_task')}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <TaskForm onSubmit={handleSubmit} submitting={submitting} />
      </View>
    </Screen>
  );
}
