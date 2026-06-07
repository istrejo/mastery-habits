import { useState, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useDateLocale } from '@core/i18n';
import { isNetworkError } from '@core/utils/isNetworkError';
import { useHabits } from '@habits/index';
import { useTodayCheckIns } from '@checkin/index';
import { useTodayTasks } from './useTodayTasks';
import { useTaskActions } from './useTaskActions';
import type { TaskWithHabit } from '../types';
import type { DashboardTaskStatus } from '../components/DashboardTaskRow';
import type { TaskCreateSheetValues } from '../components/TaskCreateSheet';

export function useTodayScreen() {
  const { i18n } = useTranslation();
  const dateLocale = useDateLocale();
  const { habits, loading: habitsLoading } = useHabits();
  const {
    tasks,
    loading: tasksLoading,
    updateTaskOptimistic,
    updateSubtaskOptimistic,
    addTaskOptimistic,
  } = useTodayTasks();
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
    new Set(),
  );
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetTask, setSheetTask] = useState<TaskWithHabit | null>(null);
  const [submittingSheet, setSubmittingSheet] = useState(false);

  const today = useMemo(() => new Date(), []);

  const currentHour = today.getHours();
  const isDaytime = currentHour >= 6 && currentHour < 18;

  const formatStr =
    i18n.language === 'en' ? 'EEEE, MMMM d' : "EEEE d 'de' MMMM";
  const todayLabel = format(today, formatStr, { locale: dateLocale });

  const completedCount = tasks.filter(
    (task) => task.status === 'completed',
  ).length;
  const pendingTasks = tasks.filter((task) => task.status !== 'completed');
  const activeTaskId = pendingTasks[0]?.id;
  const completedAllToday =
    completedCount === tasks.length && tasks.length > 0;

  const loading = tasksLoading || habitsLoading;

  const getTaskStatus = useCallback(
    (task: TaskWithHabit): DashboardTaskStatus => {
      if (task.status === 'completed') return 'completed';
      if (activeTaskId === task.id) return 'active';
      return 'pending';
    },
    [activeTaskId],
  );

  const setTaskSubmitting = useCallback(
    (taskId: string, submitting: boolean) => {
      setSubmittingTaskIds((current) => {
        const next = new Set(current);
        if (submitting) next.add(taskId);
        else next.delete(taskId);
        return next;
      });
    },
    [],
  );

  const hasOtherCompletedTaskForHabit = useCallback(
    (task: TaskWithHabit) => {
      if (!task.habit_id) return false;
      return tasks.some(
        (item) =>
          item.id !== task.id &&
          item.habit_id === task.habit_id &&
          item.status === 'completed',
      );
    },
    [tasks],
  );

  const syncHabitAfterTaskStatusChange = useCallback(
    async (before: TaskWithHabit, after: TaskWithHabit | null) => {
      if (!after || !before.habit_id) return;

      const wasCompleted = before.status === 'completed';
      const isCompleted = after.status === 'completed';

      if (
        !wasCompleted &&
        isCompleted &&
        !completedToday.has(before.habit_id)
      ) {
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
    },
    [completedToday, completeHabit, undoHabit, hasOtherCompletedTaskForHabit],
  );

  const handleInlineToggle = useCallback(
    async (task: TaskWithHabit) => {
      if (submittingTaskIds.has(task.id)) return;

      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      const completedAt =
        newStatus === 'completed' ? new Date().toISOString() : null;

      const hasSubtasks =
        task.task_subtasks && task.task_subtasks.length > 0;

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
    },
    [
      submittingTaskIds,
      updateTaskOptimistic,
      completeTask,
      uncompleteTask,
      syncHabitAfterTaskStatusChange,
    ],
  );

  const handleSubtaskToggle = useCallback(
    async (task: TaskWithHabit, subtaskId: string) => {
      if (submittingTaskIds.has(task.id)) return;

      const subtask = task.task_subtasks.find((st) => st.id === subtaskId);
      if (!subtask) return;

      const newSubtaskStatus =
        subtask.status === 'completed' ? 'pending' : 'completed';

      updateSubtaskOptimistic(task.id, subtaskId, newSubtaskStatus);

      const allSubtasksWillBeCompleted = task.task_subtasks.every((st) =>
        st.id === subtaskId
          ? newSubtaskStatus === 'completed'
          : st.status === 'completed',
      );

      const someSubtaskWillBePending = task.task_subtasks.some((st) =>
        st.id === subtaskId
          ? newSubtaskStatus === 'pending'
          : st.status === 'pending',
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
    },
    [
      submittingTaskIds,
      updateSubtaskOptimistic,
      updateTaskOptimistic,
      toggleSubtask,
      syncHabitAfterTaskStatusChange,
    ],
  );

  const handleSheetSubmit = useCallback(
    async (values: TaskCreateSheetValues) => {
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
          addTaskOptimistic(created);
        }
      } catch (error) {
        if (!isNetworkError(error)) {
          const message =
            error instanceof Error ? error.message : 'unknown_error';
          Alert.alert(
            sheetTask ? 'Could not update task' : 'Could not create task',
            message,
          );
          throw error;
        }
      } finally {
        setSubmittingSheet(false);
      }
    },
    [
      sheetTask,
      updateTaskWithSubtasks,
      createTaskWithSubtasks,
      addTaskOptimistic,
      syncHabitAfterTaskStatusChange,
    ],
  );

  const openCreateSheet = useCallback(() => {
    setSheetTask(null);
    setSheetVisible(true);
  }, []);

  const openEditSheet = useCallback((task: TaskWithHabit) => {
    setSheetTask(task);
    setSheetVisible(true);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetVisible(false);
    setSheetTask(null);
  }, []);

  return {
    tasks,
    loading,
    todayLabel,
    isDaytime,
    completedCount,
    activeTaskId,
    completedAllToday,
    getTaskStatus,
    submittingTaskIds,
    submittingHabitIds,
    sheetVisible,
    sheetTask,
    submittingSheet,
    openCreateSheet,
    openEditSheet,
    handleInlineToggle,
    handleSubtaskToggle,
    handleSheetSubmit,
    closeSheet,
  };
}
