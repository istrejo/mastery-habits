import { useState, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@core/theming';
import { useHabit } from './useHabit';
import { useHabits } from './useHabits';
import { useCheckIn } from '@checkin/index';
import type { CheckInRecord } from '@checkin/index';
import { useHabitTasks, useTaskActions } from '@tasks/index';
import type { Task } from '@tasks/index';
import { calculateStreak } from '@commitment/index';
import { getLevel, type LevelKey } from '@progression/index';
import {
  getAverageSuccessfulCheckInsPerWeek,
  getMonthlyCompletion,
  getWeeklyRhythm,
} from '../utils/habitDetailMetrics';
import type { HabitInsert } from '../types';

export function useHabitDetailScreen(id: string | undefined) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const router = useRouter();

  const { habit, loading, error, updateHabit } = useHabit(id ?? '');
  const { archiveHabit } = useHabits();
  const {
    todayCheckIn,
    last30Days,
    allCheckIns,
    canCheckInToday,
    alreadyCheckedIn,
    skipAvailable,
    loading: checkInLoading,
    errorCode: checkInErrorCode,
    markCompleted,
    markSkipped,
  } = useCheckIn(habit ?? null);

  const { tasks: habitTasks, refresh: refreshTasks } = useHabitTasks(id ?? '');
  const { completeTask, uncompleteTask, deleteTask } = useTaskActions();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  const handleToggleTask = useCallback(
    async (task: Task) => {
      if (task.status === 'completed') {
        await uncompleteTask(task.id);
      } else {
        await completeTask(task.id);
      }
      await refreshTasks();
    },
    [completeTask, uncompleteTask, refreshTasks],
  );

  const handleDeleteTask = useCallback(
    async (task: Task) => {
      await deleteTask(task.id);
      await refreshTasks();
    },
    [deleteTask, refreshTasks],
  );

  const DAY_LABELS: Record<number, string> = useMemo(
    () => ({
      1: t('habit_detail.day_mon'),
      2: t('habit_detail.day_tue'),
      3: t('habit_detail.day_wed'),
      4: t('habit_detail.day_thu'),
      5: t('habit_detail.day_fri'),
      6: t('habit_detail.day_sat'),
      7: t('habit_detail.day_sun'),
    }),
    [t],
  );

  const handleUpdate = useCallback(
    async (data: HabitInsert) => {
      setSaving(true);
      await updateHabit(data);
      setSaving(false);
      setEditing(false);
    },
    [updateHabit],
  );

  const handleArchive = useCallback(() => {
    Alert.alert(
      t('habit_detail.archive_title'),
      t('habit_detail.archive_body'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('habit_detail.archive_button'),
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            await archiveHabit(id);
            router.replace('/(tabs)');
          },
        },
      ],
    );
  }, [id, archiveHabit, router, t]);

  const openEdit = useCallback(() => {
    setActionsOpen(false);
    setEditing(true);
  }, []);

  const archiveFromActions = useCallback(() => {
    setActionsOpen(false);
    handleArchive();
  }, [handleArchive]);

  const bottomBarPadding = Math.max(insets.bottom, theme.spacing.stackSm);

  const score = habit?.mastery_scores?.score ?? 0;
  const days = (habit?.frequency_days as number[]) ?? [];
  const streak = useMemo(
    () =>
      habit
        ? calculateStreak(habit, allCheckIns)
        : { current: 0, best: 0 },
    [habit, allCheckIns],
  );
  const level = getLevel(score);
  const monthlyCompletion = getMonthlyCompletion(days, last30Days);
  const avgPerWeek = getAverageSuccessfulCheckInsPerWeek(last30Days);
  const weeklyRhythm = getWeeklyRhythm(days, last30Days);
  const weekStart = weeklyRhythm[0]?.date;
  const weekEnd = weeklyRhythm[6]?.date;
  const weeklyCompletions = weeklyRhythm.filter(
    (day) => day.status === 'completed' || day.status === 'skipped',
  ).length;

  return {
    habit,
    loading,
    error,
    todayCheckIn,
    last30Days,
    allCheckIns,
    canCheckInToday,
    alreadyCheckedIn,
    skipAvailable,
    checkInLoading,
    checkInErrorCode,
    markCompleted,
    markSkipped,
    habitTasks,
    refreshTasks,
    editing,
    setEditing,
    saving,
    actionsOpen,
    setActionsOpen,
    handleToggleTask,
    handleDeleteTask,
    DAY_LABELS,
    handleUpdate,
    handleArchive,
    openEdit,
    archiveFromActions,
    bottomBarPadding,
    score,
    days,
    streak,
    level,
    monthlyCompletion,
    avgPerWeek,
    weeklyRhythm,
    weekStart,
    weekEnd,
    weeklyCompletions,
  };
}
