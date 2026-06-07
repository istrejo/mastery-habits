import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Screen } from '@core/components';
import { useTheme } from '@core/theming';
import {
  useTasks,
  useTaskActions,
  TaskCreateSheet,
  TaskList,
} from '@tasks/index';
import type { Task } from '@tasks/index';

const tasksHeaderBase = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
};

export default function TasksIndexScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { tasks, loading, refresh } = useTasks();
  const { completeTask, createTaskWithSubtasks, uncompleteTask, deleteTask } =
    useTaskActions();
  const [createSheetVisible, setCreateSheetVisible] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);

  const pending = tasks.filter((task) => task.status === 'pending');
  const completed = tasks.filter((task) => task.status === 'completed');

  const handleToggle = async (task: Task) => {
    if (task.status === 'completed') {
      await uncompleteTask(task.id);
    } else {
      await completeTask(task.id);
    }
    await refresh();
  };

  const handleDelete = async (task: Task) => {
    await deleteTask(task.id);
    await refresh();
  };

  const handleCreate = async (values: {
    title: string;
    notes?: string | null;
    subtasks: Array<{ title: string; completed: boolean }>;
  }) => {
    setCreatingTask(true);
    try {
      await createTaskWithSubtasks(values);
      await refresh();
    } finally {
      setCreatingTask(false);
    }
  };

  return (
    <Screen
      style={{ flex: 1 }}
      contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
    >
      <View style={{ flex: 1 }}>
        <View
          style={[
            tasksHeaderBase,
            {
              paddingHorizontal: theme.spacing.marginMobile,
              paddingTop: theme.spacing.stackSm,
              paddingBottom: theme.spacing.stackSm,
              borderBottomWidth: theme.borderWidth.default,
              borderBottomColor: theme.border.default,
              backgroundColor: theme.bg.base,
            },
          ]}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcons
              name='arrow-back'
              size={22}
              color={theme.text.primary}
            />
          </Pressable>
          <Text
            style={{
              color: theme.text.primary,
              fontSize: theme.typography.scale.labelCaps.fontSize,
              fontFamily: 'Lexend_600SemiBold',
              letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
              textTransform: 'uppercase',
            }}
          >
            {t('tasks.title')}
          </Text>
          <Pressable
            onPress={() => setCreateSheetVisible(true)}
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcons name='add' size={22} color={theme.text.primary} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: theme.spacing.gutter,
            gap: theme.spacing.stackMd,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text
              style={{
                color: theme.text.secondary,
                fontSize: theme.typography.scale.labelCaps.fontSize,
                fontFamily: 'Lexend_600SemiBold',
                letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
                textTransform: 'uppercase',
                marginBottom: theme.spacing.stackSm,
              }}
            >
              {t('tasks.filters.pending')} ({pending.length})
            </Text>
            <TaskList
              tasks={pending}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          </View>

          {completed.length > 0 && (
            <View>
              <Text
                style={{
                  color: theme.text.secondary,
                  fontSize: theme.typography.scale.labelCaps.fontSize,
                  fontFamily: 'Lexend_600SemiBold',
                  letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
                  textTransform: 'uppercase',
                  marginBottom: theme.spacing.stackSm,
                }}
              >
                {t('tasks.filters.completed')} ({completed.length})
              </Text>
              <TaskList
                tasks={completed}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            </View>
          )}
        </ScrollView>
        <TaskCreateSheet
          visible={createSheetVisible}
          submitting={creatingTask}
          onClose={() => setCreateSheetVisible(false)}
          onSubmit={handleCreate}
        />
      </View>
    </Screen>
  );
}
