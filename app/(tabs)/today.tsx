/* stitch: today-dashboard */
import { useState } from 'react';
import { Alert, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Screen,
  Card,
  Skeleton,
  Button,
  SyncIndicator,
} from '@core/components';
import { useTheme } from '@core/theming';
import { useAutoSync } from '@core/hooks/useAutoSync';
import { isNetworkError } from '@core/utils/isNetworkError';
import { useDateLocale } from '@core/i18n';
import { useHabits } from '@habits/index';
import { useTodayCheckIns } from '@checkin/index';
import {
  DashboardTaskRow,
  TaskCreateSheet,
  useTaskActions,
  useTodayTasks,
  type DashboardTaskStatus,
  type TaskCreateSheetValues,
  type TaskWithHabit,
} from '@tasks/index';

function Header({ onAdd }: { onAdd: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.stackMd,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text
          style={{
            color: theme.text.primary,
            fontSize: theme.typography.scale.microBold.fontSize,
            fontFamily: 'Lexend_600SemiBold',
            letterSpacing: theme.typography.scale.microBold.letterSpacing,
            textTransform: 'uppercase',
          }}
        >
          {t('dashboard.app_name')}
        </Text>
        <SyncIndicator />
      </View>
      <TouchableOpacity
        testID='today-add-task'
        onPress={onAdd}
        hitSlop={12}
        style={{
          width: 40,
          height: 40,
          borderRadius: theme.radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name='add' size={22} color={theme.text.primary} />
      </TouchableOpacity>
    </View>
  );
}

function TodaySkeleton() {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.stackMd }}>
      <Card style={{ minHeight: 132 }}>
        <Skeleton
          width='55%'
          height={14}
          style={{ marginBottom: theme.spacing.stackSm }}
        />
        <Skeleton
          width='44%'
          height={theme.typography.scale.displaySm.fontSize}
          style={{ marginTop: theme.spacing.stackMd }}
        />
      </Card>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} height={94} borderRadius={theme.radius.lg} />
      ))}
    </View>
  );
}

function FloatingAddButton({ onPress }: { onPress: () => void }) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      testID='today-add-task'
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        position: 'absolute',
        right: 24,
        bottom: -5,
        width: 56,
        height: 56,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.text.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOpacity: 0.16,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
      }}
    >
      <MaterialIcons name='add' size={26} color={theme.text.inverse} />
    </TouchableOpacity>
  );
}

export default function TodayScreen() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const dateLocale = useDateLocale();
  const router = useRouter();
  const { habits, loading: habitsLoading } = useHabits();
  const {
    tasks,
    loading: tasksLoading,
    refresh,
    updateTaskOptimistic,
    updateSubtaskOptimistic,
  } = useTodayTasks();
  useAutoSync();
  const {
    completeTask,
    createTaskWithSubtasks,
    updateTaskWithSubtasks,
    toggleSubtask,
    uncompleteTask,
  } = useTaskActions();
  const { completedToday, completeHabit, undoHabit, submittingHabitIds } =
    useTodayCheckIns();
  const [submittingTaskIds, setSubmittingTaskIds] = useState<Set<string>>(
    new Set()
  );
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetTask, setSheetTask] = useState<TaskWithHabit | null>(null);
  const [submittingSheet, setSubmittingSheet] = useState(false);
  const today = new Date();

  // Detección simple de día/noche por hora local (6am-6pm = día)
  const currentHour = today.getHours();
  const isDaytime = currentHour >= 6 && currentHour < 18;

  // Gradientes para día/noche
  const dayGradient = ['#FFA726', '#FFEB3B'] as const;
  const nightGradient = ['#1A237E', '#4A148C'] as const;

  const formatStr =
    i18n.language === 'en' ? 'EEEE, MMMM d' : "EEEE d 'de' MMMM";
  const todayLabel = format(today, formatStr, { locale: dateLocale });
  const completedCount = tasks.filter(
    (task) => task.status === 'completed'
  ).length;
  const pendingTasks = tasks.filter((task) => task.status !== 'completed');
  const activeTaskId = pendingTasks[0]?.id;
  const completedAllToday = completedCount === tasks.length && tasks.length > 0;
  const avgScore =
    habits.length > 0
      ? habits.reduce(
          (sum, habit) => sum + (habit.mastery_scores?.score ?? 0),
          0
        ) / habits.length
      : 0;
  const loading = tasksLoading || habitsLoading;

  const getTaskStatus = (task: TaskWithHabit): DashboardTaskStatus => {
    if (task.status === 'completed') return 'completed';
    if (activeTaskId === task.id) return 'active';
    return 'pending';
  };

  const setTaskSubmitting = (taskId: string, submitting: boolean) => {
    setSubmittingTaskIds((current) => {
      const next = new Set(current);
      if (submitting) next.add(taskId);
      else next.delete(taskId);
      return next;
    });
  };

  const hasOtherCompletedTaskForHabit = (task: TaskWithHabit) => {
    if (!task.habit_id) return false;
    return tasks.some(
      (item) =>
        item.id !== task.id &&
        item.habit_id === task.habit_id &&
        item.status === 'completed'
    );
  };

  const syncHabitAfterTaskStatusChange = async (
    before: TaskWithHabit,
    after: TaskWithHabit | null
  ) => {
    if (!after || !before.habit_id) return;

    const wasCompleted = before.status === 'completed';
    const isCompleted = after.status === 'completed';

    if (!wasCompleted && isCompleted && !completedToday.has(before.habit_id)) {
      await completeHabit(before.habit_id);
      return;
    }

    if (
      wasCompleted &&
      !isCompleted &&
      completedToday.has(before.habit_id) &&
      !hasOtherCompletedTaskForHabit(before)
    ) {
      await undoHabit(before.habit_id);
    }
  };

  const handleInlineToggle = async (task: TaskWithHabit) => {
    if (submittingTaskIds.has(task.id)) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const completedAt =
      newStatus === 'completed' ? new Date().toISOString() : null;

    const hasSubtasks = task.task_subtasks && task.task_subtasks.length > 0;

    if (hasSubtasks && newStatus === 'completed') {
      const updatedSubtasks = task.task_subtasks.map((st) => ({
        ...st,
        status: 'completed' as const,
        completed_at: new Date().toISOString(),
      }));

      updateTaskOptimistic(task.id, {
        status: newStatus,
        completed_at: completedAt,
        task_subtasks: updatedSubtasks,
      });
    } else {
      updateTaskOptimistic(task.id, {
        status: newStatus,
        completed_at: completedAt,
      });
    }

    try {
      const updated = await (task.status === 'completed'
        ? uncompleteTask(task.id)
        : completeTask(task.id));
      if (!updated) throw new Error('task_not_updated');
      await syncHabitAfterTaskStatusChange(task, updated);
    } catch (error) {
      if (!isNetworkError(error)) {
        updateTaskOptimistic(task.id, {
          status: task.status,
          completed_at: task.completed_at,
          task_subtasks: task.task_subtasks,
        });
        const message =
          error instanceof Error ? error.message : 'unknown_error';
        Alert.alert('Could not update task', message);
      }
    }
  };

  const handleSubtaskToggle = async (
    task: TaskWithHabit,
    subtaskId: string
  ) => {
    if (submittingTaskIds.has(task.id)) return;

    const subtask = task.task_subtasks.find((st) => st.id === subtaskId);
    if (!subtask) return;

    const newSubtaskStatus =
      subtask.status === 'completed' ? 'pending' : 'completed';

    updateSubtaskOptimistic(task.id, subtaskId, newSubtaskStatus);

    const allSubtasksWillBeCompleted = task.task_subtasks.every((st) =>
      st.id === subtaskId
        ? newSubtaskStatus === 'completed'
        : st.status === 'completed'
    );

    const someSubtaskWillBePending = task.task_subtasks.some((st) =>
      st.id === subtaskId
        ? newSubtaskStatus === 'pending'
        : st.status === 'pending'
    );

    if (task.status === 'completed' && someSubtaskWillBePending) {
      updateTaskOptimistic(task.id, {
        status: 'pending',
        completed_at: null,
      });
    }

    if (task.status === 'pending' && allSubtasksWillBeCompleted) {
      updateTaskOptimistic(task.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
    }

    try {
      const updated = await toggleSubtask(task.id, subtaskId);
      if (!updated) throw new Error('task_not_updated');
      await syncHabitAfterTaskStatusChange(task, updated);
    } catch (error) {
      if (!isNetworkError(error)) {
        updateSubtaskOptimistic(task.id, subtaskId, subtask.status);
        updateTaskOptimistic(task.id, {
          status: task.status,
          completed_at: task.completed_at,
        });
        const message =
          error instanceof Error ? error.message : 'unknown_error';
        Alert.alert('Could not update subtask', message);
      }
    }
  };

  const handleSheetSubmit = async (values: TaskCreateSheetValues) => {
    setSubmittingSheet(true);
    try {
      if (sheetTask) {
        const before = sheetTask;
        const updated = await updateTaskWithSubtasks(sheetTask.id, {
          title: values.title,
          notes: values.notes ?? null,
          subtasks: values.subtasks,
        });
        if (!updated) throw new Error('task_not_updated');
        await syncHabitAfterTaskStatusChange(before, updated);
      } else {
        const created = await createTaskWithSubtasks({
          title: values.title,
          notes: values.notes ?? null,
          subtasks: values.subtasks,
        });
        if (!created) throw new Error('task_not_created');
      }
      await refresh();
    } catch (error) {
      if (!isNetworkError(error)) {
        const message =
          error instanceof Error ? error.message : 'unknown_error';
        Alert.alert(
          sheetTask ? 'Could not update task' : 'Could not create task',
          message
        );
        throw error;
      }
    } finally {
      setSubmittingSheet(false);
    }
  };

  const openCreateSheet = () => {
    setSheetTask(null);
    setSheetVisible(true);
  };

  const openEditSheet = (task: TaskWithHabit) => {
    setSheetTask(task);
    setSheetVisible(true);
  };

  return (
    <Screen
      contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.marginMobile,
          paddingTop: theme.spacing.stackMd,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Header onAdd={openCreateSheet} />

        {loading ? (
          <TodaySkeleton />
        ) : tasks.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: theme.spacing.stackLg * 2,
            }}
          >
            <Text
              style={{
                color: theme.text.primary,
                fontSize: theme.typography.scale.titleLg.fontSize,
                lineHeight: theme.typography.scale.titleLg.lineHeight,
                fontFamily: 'Anton_400Regular',
                textAlign: 'center',
                textTransform: 'uppercase',
                marginBottom: theme.spacing.stackSm,
              }}
            >
              {t('dashboard.empty_tasks_title')}
            </Text>
            <Text
              style={{
                color: theme.text.secondary,
                fontSize: theme.typography.scale.bodyMain.fontSize,
                lineHeight: theme.typography.scale.bodyMain.lineHeight,
                fontFamily: 'Lexend_400Regular',
                textAlign: 'center',
                marginBottom: theme.spacing.stackLg,
              }}
            >
              {t('dashboard.empty_tasks_body')}
            </Text>
            <Button
              label={t('dashboard.create_task')}
              onPress={openCreateSheet}
              iconRight='arrow-forward'
            />
          </View>
        ) : (
          <View style={{ gap: theme.spacing.stackMd }}>
            <Card
              style={{
                minHeight: 150,
                justifyContent: 'space-between',
                padding: 0,
                overflow: 'hidden',
              }}
            >
              <LinearGradient
                colors={isDaytime ? dayGradient : nightGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flex: 1,
                  padding: 18,
                  justifyContent: 'space-between',
                }}
              >
                <View>
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: theme.typography.scale.labelCaps.fontSize,
                      lineHeight: theme.typography.scale.labelCaps.lineHeight,
                      fontFamily: 'Lexend_600SemiBold',
                      letterSpacing: 1.4,
                      textTransform: 'uppercase',
                      marginBottom: 6,
                      opacity: 0.9,
                    }}
                  >
                    {t('dashboard.today_protocol')}
                  </Text>
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: theme.typography.scale.bodyMain.fontSize,
                      lineHeight: theme.typography.scale.bodyMain.lineHeight,
                      fontFamily: 'Lexend_400Regular',
                      opacity: 0.95,
                    }}
                  >
                    {completedAllToday
                      ? t('dashboard.tasks_all_done')
                      : t('dashboard.tasks_today', { count: tasks.length })}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    marginTop: theme.spacing.stackMd,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: theme.typography.scale.displaySm.fontSize,
                        lineHeight: theme.typography.scale.displaySm.lineHeight,
                        fontFamily: 'Anton_400Regular',
                        letterSpacing:
                          theme.typography.scale.displaySm.letterSpacing,
                      }}
                    >
                      {todayLabel}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: theme.radius.pill,
                      borderWidth: 2,
                      borderColor: '#FFFFFF',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <MaterialIcons
                      name={isDaytime ? 'wb-sunny' : 'nightlight'}
                      size={24}
                      color='#FFFFFF'
                    />
                  </View>
                </View>
              </LinearGradient>
            </Card>

            <View style={{ marginTop: theme.spacing.stackSm }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: theme.spacing.stackMd,
                  paddingBottom: theme.spacing.stackSm,
                  borderBottomWidth: theme.borderWidth.default,
                  borderBottomColor: theme.border.default,
                }}
              >
                <Text
                  style={{
                    color: theme.text.primary,
                    fontSize: theme.typography.scale.titleSm.fontSize,
                    lineHeight: theme.typography.scale.titleSm.lineHeight,
                    fontFamily: 'Anton_400Regular',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('dashboard.tasks_section')}
                </Text>
                <Text
                  style={{
                    color: theme.text.secondary,
                    fontSize: theme.typography.scale.labelCaps.fontSize,
                    lineHeight: theme.typography.scale.labelCaps.lineHeight,
                    fontFamily: 'Lexend_600SemiBold',
                    letterSpacing:
                      theme.typography.scale.labelCaps.letterSpacing,
                    textTransform: 'uppercase',
                  }}
                >
                  {t('dashboard.tasks_completed', {
                    completed: completedCount,
                    count: tasks.length,
                  })}
                </Text>
              </View>

              {tasks.map((task) => (
                <DashboardTaskRow
                  key={task.id}
                  task={task}
                  status={getTaskStatus(task)}
                  inlineProgressPercent={
                    activeTaskId === task.id ? 30 : undefined
                  }
                  checkDisabled={
                    submittingTaskIds.has(task.id) ||
                    (task.habit_id
                      ? submittingHabitIds.has(task.habit_id)
                      : false)
                  }
                  submitting={submittingTaskIds.has(task.id)}
                  onPressRow={() => openEditSheet(task)}
                  onPressCheck={() => {
                    void handleInlineToggle(task);
                  }}
                  onPressSubtask={(subtaskId) => {
                    void handleSubtaskToggle(task, subtaskId);
                  }}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <FloatingAddButton onPress={openCreateSheet} />
      <TaskCreateSheet
        task={sheetTask}
        visible={sheetVisible}
        submitting={submittingSheet}
        onClose={() => {
          setSheetVisible(false);
          setSheetTask(null);
        }}
        onSubmit={handleSheetSubmit}
      />
    </Screen>
  );
}
