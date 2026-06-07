/* stitch: today-dashboard */
import { View, Text, Pressable, ScrollView } from 'react-native';
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
import {
  DashboardTaskRow,
  TaskCreateSheet,
  useTodayScreen,
} from '@tasks/index';

const dayGradient = ['#FFA726', '#FFEB3B'] as const;
const nightGradient = ['#1A237E', '#4A148C'] as const;

const todaySectionLabelBase = {
  fontFamily: 'Lexend_600SemiBold' as const,
  letterSpacing: 1.4,
  textTransform: 'uppercase' as const,
  marginBottom: 6,
  opacity: 0.9,
  color: '#FFFFFF' as const,
};

const timeIconCircleBase = {
  width: 48,
  height: 48,
  borderWidth: 2,
  borderColor: '#FFFFFF' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  backgroundColor: 'rgba(255, 255, 255, 0.2)' as const,
};

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
      <Pressable
        testID='today-add-task'
        onPress={onAdd}
        hitSlop={12}
        style={({ pressed }) => [{
          width: 40,
          height: 40,
          borderRadius: theme.radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
        }, { opacity: pressed ? 0.2 : 1 }]}
      >
        <MaterialIcons name='add' size={22} color={theme.text.primary} />
      </Pressable>
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
    <Pressable
      testID='today-add-task'
      onPress={onPress}
      style={({ pressed }) => [{
        position: 'absolute',
        right: 24,
        bottom: -5,
        width: 56,
        height: 56,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.text.primary,
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: [{ offsetX: 0, offsetY: 8, blurRadius: 12, color: 'rgba(0, 0, 0, 0.16)' }],
      }, { opacity: pressed ? 0.9 : 1 }]}
    >
      <MaterialIcons name='add' size={26} color={theme.text.inverse} />
    </Pressable>
  );
}

function TodayHeroCard({
  isDaytime,
  todayLabel,
  tasks,
  completedAllToday,
}: {
  isDaytime: boolean;
  todayLabel: string;
  tasks: Array<{ status: string }>;
  completedAllToday: boolean;
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
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
                    style={[
                      todaySectionLabelBase,
                      {
                        fontSize: theme.typography.scale.labelCaps.fontSize,
                        lineHeight: theme.typography.scale.labelCaps.lineHeight,
                      },
                    ]}
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
                      style={[
                        timeIconCircleBase,
                        { borderRadius: theme.radius.pill },
                      ]}
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
  );
}

function EmptyTodayState({ onCreateTask }: { onCreateTask: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
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
        onPress={onCreateTask}
        iconRight='arrow-forward'
      />
    </View>
  );
}

function TaskSectionHeader({
  completedCount,
  totalCount,
}: {
  completedCount: number;
  totalCount: number;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
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
          count: totalCount,
        })}
      </Text>
    </View>
  );
}

export default function TodayScreen() {
  const theme = useTheme();
  const {
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
  } = useTodayScreen();

  return (
    <Screen
      contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: theme.spacing.marginMobile, paddingTop: theme.spacing.stackMd }}>
          <Header onAdd={openCreateSheet} />

          {loading ? (
            <TodaySkeleton />
          ) : tasks.length === 0 ? (
            <EmptyTodayState onCreateTask={openCreateSheet} />
          ) : (
            <View style={{ gap: theme.spacing.stackMd }}>
              <TodayHeroCard
                isDaytime={isDaytime}
                todayLabel={todayLabel}
                tasks={tasks}
                completedAllToday={completedAllToday}
              />

              <View style={{ marginTop: theme.spacing.stackSm }}>
                <TaskSectionHeader
                  completedCount={completedCount}
                  totalCount={tasks.length}
                />

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
        </View>
        <View style={{ height: 140 }} />
      </ScrollView>

      <FloatingAddButton onPress={openCreateSheet} />
      <TaskCreateSheet
        task={sheetTask}
        visible={sheetVisible}
        submitting={submittingSheet}
        onClose={closeSheet}
        onSubmit={handleSheetSubmit}
      />
    </Screen>
  );
}
