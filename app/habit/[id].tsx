import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format, subDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Modal, Screen } from '@core/components';
import { useTheme } from '@core/theming';
import {
  CategoryBadge,
  HabitForm,
  useHabit,
  useHabits,
} from '@habits/index';
import type { HabitInsert } from '@habits/index';
import type { HabitCategoryId } from '@habits/constants/categories';
import {
  getAverageSuccessfulCheckInsPerWeek,
  getMonthlyCompletion,
  getWeeklyRhythm,
  type WeeklyRhythmStatus,
} from '@habits/utils/habitDetailMetrics';
import { CheckInButton, useCheckIn } from '@checkin/index';
import { calculateStreak } from '@commitment/index';
import { getLevel, getLocalizedLevelLabel, LevelProgress, MasteryBadge, type LevelKey } from '@progression/index';
import { useHabitTasks, useTaskActions, TaskComposer, TaskList } from '@tasks/index';
import type { Task } from '@tasks/index';

function HistoryGrid({
  checkIns,
}: {
  checkIns: { check_date: string; status: string }[];
}) {
  const theme = useTheme();
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, index) => {
    const date = subDays(today, 29 - index);
    const dateStr = format(date, 'yyyy-MM-dd');
    const record = checkIns.find((item) => item.check_date === dateStr);
    return { dateStr, status: record?.status ?? null };
  });

  const colorForStatus = (status: string | null) => {
    if (status === 'completed') return theme.status.success;
    if (status === 'skipped') return theme.text.secondary;
    if (status === 'missed') return theme.status.danger;
    return theme.bg.surfaceAlt;
  };

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.unit }}>
      {days.map((item) => (
        <View
          key={item.dateStr}
          style={{
            width: theme.spacing.gutter - 2,
            height: theme.spacing.gutter - 2,
            borderRadius: theme.radius.sm,
            backgroundColor: colorForStatus(item.status),
            borderWidth: theme.borderWidth.default,
            borderColor: item.status ? 'transparent' : theme.border.default,
          }}
        />
      ))}
    </View>
  );
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        width: '48.5%',
        backgroundColor: theme.bg.base,
        borderWidth: theme.borderWidth.default,
        borderColor: theme.border.default,
        borderRadius: theme.radius.md,
        padding: theme.spacing.stackMd,
        gap: theme.spacing.unit,
      }}
    >
      <Text
        style={{
          color: theme.text.secondary,
          fontSize: theme.typography.scale.microBold.fontSize,
          fontFamily: 'Lexend_600SemiBold',
          letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: theme.text.primary,
          fontSize: theme.typography.scale.titleSm.fontSize,
          lineHeight: theme.typography.scale.titleSm.lineHeight,
          fontFamily: 'Anton_400Regular',
          letterSpacing: theme.typography.scale.titleSm.letterSpacing,
          fontVariant: ['tabular-nums'],
        }}
      >
        {value}
      </Text>
      {helper ? (
        <Text
          style={{
            color: theme.text.tertiary,
            fontSize: theme.typography.scale.microBold.fontSize,
            fontFamily: 'Lexend_400Regular',
          }}
        >
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

function CompletionRing({ percent, label }: { percent: number; label: string }) {
  const theme = useTheme();

  return (
    <View style={{ alignItems: 'center', gap: theme.spacing.stackSm }}>
      <View
        style={{
          width: 108,
          height: 108,
          borderRadius: theme.radius.pill,
          borderWidth: 8,
          borderColor: theme.text.primary,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.bg.base,
        }}
      >
        <Text
          style={{
            color: theme.text.primary,
            fontSize: theme.typography.scale.titleSm.fontSize,
            fontFamily: 'Anton_400Regular',
            letterSpacing: theme.typography.scale.titleSm.letterSpacing,
            fontVariant: ['tabular-nums'],
          }}
        >
          {percent}%
        </Text>
        <Text
          style={{
            color: theme.text.secondary,
            fontSize: theme.typography.scale.microBold.fontSize,
            fontFamily: 'Lexend_600SemiBold',
            letterSpacing: theme.typography.scale.microBold.letterSpacing,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

function LegendItem({
  color,
  label,
  outlined = false,
}: {
  color: string;
  label: string;
  outlined?: boolean;
}) {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 2,
          backgroundColor: outlined ? 'transparent' : color,
          borderWidth: theme.borderWidth.default,
          borderColor: outlined ? color : 'transparent',
        }}
      />
      <Text
        style={{
          color: theme.text.tertiary,
          fontSize: theme.typography.scale.microBold.fontSize,
          fontFamily: 'Lexend_400Regular',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function getRhythmColors(status: WeeklyRhythmStatus, isToday: boolean, theme: ReturnType<typeof useTheme>) {
  if (status === 'completed') {
    return {
      backgroundColor: theme.text.primary,
      borderColor: theme.text.primary,
      icon: 'check' as const,
      iconColor: theme.text.inverse,
    };
  }

  if (status === 'skipped') {
    return {
      backgroundColor: theme.bg.surfaceAlt,
      borderColor: theme.text.secondary,
      icon: 'fast-forward' as const,
      iconColor: theme.text.secondary,
    };
  }

  if (status === 'missed') {
    return {
      backgroundColor: 'rgba(186, 26, 26, 0.08)',
      borderColor: theme.status.danger,
      icon: 'close' as const,
      iconColor: theme.status.danger,
    };
  }

  if (status === 'pending') {
    return {
      backgroundColor: theme.bg.surface,
      borderColor: isToday ? theme.text.primary : theme.border.default,
      icon: undefined,
      iconColor: theme.text.primary,
    };
  }

  return {
    backgroundColor: theme.bg.base,
    borderColor: theme.border.default,
    icon: undefined,
    iconColor: theme.text.tertiary,
  };
}

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const router = useRouter();
  const { habit, loading, error, updateHabit } = useHabit(id);
  const { archiveHabit } = useHabits();
  const {
    todayCheckIn,
    last30Days,
    allCheckIns,
    canCheckInToday,
    alreadyCheckedIn,
    skipAvailable,
    loading: checkInLoading,
    error: checkInError,
    markCompleted,
    markSkipped,
  } = useCheckIn(habit ?? null);

  const { tasks: habitTasks, refresh: refreshTasks } = useHabitTasks(id ?? '');
  const { completeTask, uncompleteTask, deleteTask } = useTaskActions();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  const handleToggleTask = async (task: Task) => {
    if (task.status === 'completed') {
      await uncompleteTask(task.id);
    } else {
      await completeTask(task.id);
    }
    await refreshTasks();
  };

  const handleDeleteTask = async (task: Task) => {
    await deleteTask(task.id);
    await refreshTasks();
  };

  const DAY_LABELS: Record<number, string> = {
    1: t('habit_detail.day_mon'),
    2: t('habit_detail.day_tue'),
    3: t('habit_detail.day_wed'),
    4: t('habit_detail.day_thu'),
    5: t('habit_detail.day_fri'),
    6: t('habit_detail.day_sat'),
    7: t('habit_detail.day_sun'),
  };

  const handleUpdate = async (data: HabitInsert) => {
    setSaving(true);
    await updateHabit(data);
    setSaving(false);
    setEditing(false);
  };

  const handleArchive = () => {
    Alert.alert(
      t('habit_detail.archive_title'),
      t('habit_detail.archive_body'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('habit_detail.archive_button'),
          style: 'destructive',
          onPress: async () => {
            await archiveHabit(id);
            router.replace('/(tabs)');
          },
        },
      ],
    );
  };

  const openEdit = () => {
    setActionsOpen(false);
    setEditing(true);
  };

  const archiveFromActions = () => {
    setActionsOpen(false);
    handleArchive();
  };

  const bottomBarPadding = Math.max(insets.bottom, theme.spacing.stackSm);

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={theme.text.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (error || !habit) {
    return (
      <Screen>
        <Text style={{ color: theme.status.danger }}>
          {error ?? t('habit_detail.not_found')}
        </Text>
      </Screen>
    );
  }

  const score = habit.mastery_scores?.score ?? 0;
  const days = habit.frequency_days as number[];
  const streak = calculateStreak(habit, allCheckIns);
  const level = getLevel(score);
  const monthlyCompletion = getMonthlyCompletion(days, last30Days);
  const avgPerWeek = getAverageSuccessfulCheckInsPerWeek(last30Days);
  const weeklyRhythm = getWeeklyRhythm(days, last30Days);
  const weekStart = weeklyRhythm[0]?.date;
  const weekEnd = weeklyRhythm[6]?.date;
  const weeklyCompletions = weeklyRhythm.filter(
    (day) => day.status === 'completed' || day.status === 'skipped',
  ).length;

  if (editing) {
    return (
      <Screen
        style={{ flex: 1 }}
        contentStyle={{
          paddingHorizontal: 0,
          paddingTop: 0,
          paddingBottom: 0,
        }}
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
              onPress={() => setEditing(false)}
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
              {t('habit_detail.edit_title')}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: theme.spacing.marginMobile,
              paddingTop: theme.spacing.stackMd,
              paddingBottom: theme.spacing.stackLg,
            }}
            showsVerticalScrollIndicator={false}
          >
            <HabitForm
              defaultValues={{
                name: habit.name,
                description: habit.description ?? '',
                category: habit.category as HabitCategoryId,
                custom_label: habit.custom_label ?? '',
                custom_emoji: habit.custom_emoji ?? '✨',
                frequency_days: days,
              }}
              onSubmit={handleUpdate}
              submitLabel={t('habit_detail.save_changes')}
              loading={saving}
            />
            <Button
              label={t('common.cancel')}
              variant="ghost"
              onPress={() => setEditing(false)}
              style={{ marginTop: theme.spacing.stackSm }}
            />
          </ScrollView>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      style={{ flex: 1 }}
      contentStyle={{
        paddingHorizontal: 0,
        paddingTop: 0,
        paddingBottom: 0,
      }}
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
            gap: theme.spacing.stackSm,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
          >
            <MaterialIcons name="arrow-back" size={22} color={theme.text.primary} />
          </TouchableOpacity>

          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              textAlign: 'center',
              color: theme.text.primary,
              fontSize: theme.typography.scale.labelCaps.fontSize,
              fontFamily: 'Lexend_600SemiBold',
              letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
              textTransform: 'uppercase',
            }}
          >
            {habit.name}
          </Text>

          <TouchableOpacity
            accessibilityLabel={t('habit_detail.open_actions')}
            onPress={() => setActionsOpen(true)}
            style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
          >
            <MaterialIcons name="more-horiz" size={22} color={theme.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.marginMobile,
            paddingTop: theme.spacing.stackMd,
            paddingBottom: 180 + bottomBarPadding,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Card style={{ marginBottom: theme.spacing.stackMd }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: theme.spacing.stackMd,
              }}
            >
              <View style={{ flex: 1 }}>
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
                  {t('habit_detail.current_momentum')}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                  <Text
                    style={{
                      color: theme.text.primary,
                      fontSize: theme.typography.scale.displaySm.fontSize,
                      lineHeight: theme.typography.scale.displaySm.lineHeight,
                      fontFamily: 'Anton_400Regular',
                      letterSpacing: theme.typography.scale.displaySm.letterSpacing,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {streak.current}
                  </Text>
                  <Text
                    style={{
                      color: theme.text.primary,
                      fontSize: theme.typography.scale.titleSm.fontSize,
                      fontFamily: 'Anton_400Regular',
                      letterSpacing: theme.typography.scale.titleSm.letterSpacing,
                    }}
                  >
                    {t('stats.days')}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: theme.spacing.stackSm,
                    marginTop: theme.spacing.stackSm,
                    marginBottom: theme.spacing.stackSm,
                  }}
                >
                  <CategoryBadge habit={habit} size="md" showLabel />
                  <MasteryBadge score={score} />
                </View>

                {habit.description ? (
                  <Text
                    style={{
                      color: theme.text.secondary,
                      fontSize: theme.typography.scale.bodyMain.fontSize,
                      lineHeight: theme.typography.scale.bodyMain.lineHeight,
                      fontFamily: 'Lexend_400Regular',
                    }}
                  >
                    {habit.description}
                  </Text>
                ) : null}
              </View>

              <CompletionRing
                percent={monthlyCompletion.percent}
                label={t('habit_detail.monthly_completion')}
              />
            </View>

            {habit.category === 'custom' && habit.custom_label === 'Sin categorizar' ? (
              <View
                style={{
                  marginTop: theme.spacing.stackMd,
                  padding: theme.spacing.stackSm,
                  borderLeftWidth: 3,
                  borderLeftColor: theme.text.secondary,
                  backgroundColor: theme.bg.base,
                  borderRadius: theme.radius.sm,
                }}
              >
                <Text
                  style={{
                    color: theme.text.secondary,
                    fontSize: theme.typography.scale.microBold.fontSize,
                    fontFamily: 'Lexend_500Medium',
                  }}
                >
                  💡 {t('custom_category.uncategorized_banner')}
                </Text>
              </View>
            ) : null}

            <View style={{ marginTop: theme.spacing.stackMd }}>
              <LevelProgress score={score} />
            </View>
          </Card>

          <Card style={{ marginBottom: theme.spacing.stackMd }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: theme.spacing.stackMd,
              }}
            >
              <Text
                style={{
                  color: theme.text.primary,
                  fontSize: theme.typography.scale.titleSm.fontSize,
                  lineHeight: theme.typography.scale.titleSm.lineHeight,
                  fontFamily: 'Anton_400Regular',
                  letterSpacing: theme.typography.scale.titleSm.letterSpacing,
                  textTransform: 'uppercase',
                }}
              >
                {t('habit_detail.weekly_rhythm')}
              </Text>
              <Text
                style={{
                  color: theme.text.secondary,
                  fontSize: theme.typography.scale.microBold.fontSize,
                  fontFamily: 'Lexend_600SemiBold',
                  letterSpacing: theme.typography.scale.microBold.letterSpacing,
                  textTransform: 'uppercase',
                }}
              >
                {weekStart && weekEnd
                  ? `${format(weekStart, 'MMM d')} — ${format(weekEnd, 'MMM d')}`
                  : t('habit_detail.this_week')}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.unit * 2 }}>
              {weeklyRhythm.map((day) => {
                const rhythmStyle = getRhythmColors(day.status, day.isToday, theme);
                const label = DAY_LABELS[day.isoDay] ?? '';

                return (
                  <View
                    key={day.dateKey}
                    style={{ flex: 1, alignItems: 'center', gap: theme.spacing.stackSm }}
                  >
                    <Text
                      style={{
                        color: day.isToday ? theme.text.primary : theme.text.secondary,
                        fontSize: theme.typography.scale.microBold.fontSize,
                        fontFamily: 'Lexend_600SemiBold',
                        letterSpacing: theme.typography.scale.microBold.letterSpacing,
                        textTransform: 'uppercase',
                      }}
                    >
                      {label.slice(0, 1)}
                    </Text>
                    <View
                      style={{
                        width: '100%',
                        aspectRatio: 1,
                        borderRadius: theme.radius.md,
                        borderWidth: theme.borderWidth.default,
                        borderColor: rhythmStyle.borderColor,
                        backgroundColor: rhythmStyle.backgroundColor,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {rhythmStyle.icon ? (
                        <MaterialIcons
                          name={rhythmStyle.icon}
                          size={16}
                          color={rhythmStyle.iconColor}
                        />
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: theme.spacing.stackSm,
                marginTop: theme.spacing.stackMd,
                marginBottom: theme.spacing.stackSm,
              }}
            >
              <LegendItem color={theme.text.primary} label={t('habit_detail.legend_completed')} />
              <LegendItem color={theme.text.secondary} label={t('habit_detail.legend_skip')} outlined />
              <LegendItem color={theme.status.danger} label={t('habit_detail.legend_missed')} />
              <LegendItem color={theme.border.strong} label={t('habit_detail.legend_pending')} outlined />
            </View>

            <Text
              style={{
                color: theme.text.secondary,
                fontSize: theme.typography.scale.bodyMain.fontSize,
                lineHeight: theme.typography.scale.bodyMain.lineHeight,
                fontFamily: 'Lexend_400Regular',
              }}
            >
              {t('habit_detail.frequency_section')}: {days.map((day) => DAY_LABELS[day]).join(' · ')}
            </Text>
          </Card>

          <Card style={{ marginBottom: theme.spacing.stackMd }}>
            <Text
              style={{
                color: theme.text.secondary,
                fontSize: theme.typography.scale.labelCaps.fontSize,
                fontFamily: 'Lexend_600SemiBold',
                letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
                textTransform: 'uppercase',
                marginBottom: theme.spacing.stackMd,
              }}
            >
              {t('habit_detail.stats_section')}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                rowGap: theme.spacing.stackSm,
              }}
            >
              <MetricCard
                label={t('habit_detail.commitment_score')}
                value={score.toFixed(1)}
                helper={getLocalizedLevelLabel(level.key as LevelKey, t)}
              />
              <MetricCard
                label={t('habit_detail.best_streak')}
                value={`${streak.best}`}
                helper={t('stats.days')}
              />
              <MetricCard
                label={t('habit_detail.completion_rate')}
                value={`${monthlyCompletion.percent}%`}
                helper={`${monthlyCompletion.completed}/${monthlyCompletion.planned}`}
              />
              <MetricCard
                label={t('habit_detail.avg_per_week')}
                value={`${avgPerWeek}`}
                helper={`${weeklyCompletions}/${days.length} ${t('habit_detail.this_week').toLowerCase()}`}
              />
            </View>
          </Card>

          <Card>
            <Text
              style={{
                color: theme.text.secondary,
                fontSize: theme.typography.scale.labelCaps.fontSize,
                fontFamily: 'Lexend_600SemiBold',
                letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
                textTransform: 'uppercase',
                marginBottom: theme.spacing.stackMd,
              }}
            >
              {t('habit_detail.history_section')}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: theme.spacing.stackSm,
                marginBottom: theme.spacing.stackSm,
              }}
            >
              <LegendItem color={theme.text.primary} label={t('habit_detail.legend_completed')} />
              <LegendItem color={theme.text.secondary} label={t('habit_detail.legend_skip')} outlined />
              <LegendItem color={theme.status.danger} label={t('habit_detail.legend_missed')} />
            </View>

            <HistoryGrid checkIns={last30Days} />
          </Card>

          <Card style={{ marginTop: theme.spacing.stackMd }}>
            <Text
              style={{
                color: theme.text.secondary,
                fontSize: theme.typography.scale.labelCaps.fontSize,
                fontFamily: 'Lexend_600SemiBold',
                letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
                textTransform: 'uppercase',
                marginBottom: theme.spacing.stackMd,
              }}
            >
              {t('tasks.title')}
            </Text>
            <TaskComposer habitId={id} onCreated={refreshTasks} />
            <View style={{ marginTop: theme.spacing.stackSm }}>
              <TaskList
                tasks={habitTasks}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
              />
            </View>
          </Card>
        </ScrollView>

        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: theme.spacing.marginMobile,
            paddingTop: theme.spacing.stackSm,
            paddingBottom: bottomBarPadding + theme.spacing.stackSm,
            backgroundColor: theme.bg.base,
            borderTopWidth: theme.borderWidth.default,
            borderTopColor: theme.border.default,
            gap: theme.spacing.stackSm,
          }}
        >
          <Text
            style={{
              color: theme.text.secondary,
              fontSize: theme.typography.scale.labelCaps.fontSize,
              fontFamily: 'Lexend_600SemiBold',
              letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
              textTransform: 'uppercase',
            }}
          >
            {t('habit_detail.today_section')}
          </Text>

          <CheckInButton
            canCheckIn={canCheckInToday}
            alreadyCheckedIn={alreadyCheckedIn}
            todayCheckIn={todayCheckIn}
            skipAvailable={skipAvailable}
            loading={checkInLoading}
            onComplete={markCompleted}
            onSkip={markSkipped}
            style={{ width: '100%' }}
          />

          {checkInError ? (
            <Text
              style={{
                color: theme.status.danger,
                fontSize: theme.typography.scale.microBold.fontSize,
                fontFamily: 'Lexend_500Medium',
              }}
            >
              {t('habit_detail.checkin_error')}
            </Text>
          ) : null}
        </View>

        <Modal
          visible={actionsOpen}
          onClose={() => setActionsOpen(false)}
          title={t('habit_detail.actions_title')}
        >
          <View style={{ gap: theme.spacing.stackSm }}>
            <Button
              label={t('habit_detail.actions_edit')}
              variant="secondary"
              onPress={openEdit}
            />
            <Button
              label={t('habit_detail.actions_archive')}
              variant="danger"
              onPress={archiveFromActions}
            />
            <Button
              label={t('common.cancel')}
              variant="ghost"
              onPress={() => setActionsOpen(false)}
            />
          </View>
        </Modal>
      </View>
    </Screen>
  );
}
