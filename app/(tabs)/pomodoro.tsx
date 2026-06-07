import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@core/components';
import { useTheme } from '@core/theming';
import {
  usePomodoroTimer,
  TimerDisplay,
  TimerControls,
  PhaseIndicator,
  PomodoroTargetPicker,
} from '@pomodoro/index';
import { useCheckIn } from '@checkin/index';
import { useTaskActions } from '@tasks/index';
import { useHabits } from '@habits/index';

const pomodoroSectionBase = {
  width: '100%' as const,
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
};

export default function PomodoroScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { habits } = useHabits();

  const {
    status,
    phase,
    cycleIndex,
    remainingSeconds,
    targetHabitId,
    targetTaskId,
    autoCheckIn,
    config,
    start,
    pause,
    resume,
    skipPhase,
    reset,
    setAutoCheckIn,
    onSessionFinish,
  } = usePomodoroTimer();

  const [localHabitId, setLocalHabitId] = useState<string | null>(targetHabitId);
  const [localTaskId, setLocalTaskId] = useState<string | null>(targetTaskId);

  const targetHabit = habits.find((h) => h.id === targetHabitId) ?? null;
  const { markCompleted } = useCheckIn(targetHabit);
  const { completeTask } = useTaskActions();

  // Wire auto side-effects at the screen layer (isolation pattern)
  useEffect(() => {
    return onSessionFinish(async ({ prevPhase }) => {
      if (prevPhase !== 'work') return;
      if (autoCheckIn && targetHabitId) {
        await markCompleted();
      }
      if (targetTaskId) {
        await completeTask(targetTaskId);
      }
    });
  }, [onSessionFinish, autoCheckIn, targetHabitId, targetTaskId, markCompleted, completeTask]);

  const handleStart = () => {
    start(
      localHabitId || localTaskId
        ? { habitId: localHabitId ?? undefined, taskId: localTaskId ?? undefined }
        : null,
    );
  };

  return (
    <Screen style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.gutter,
          gap: theme.spacing.stackLg,
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            color: theme.text.primary,
            fontSize: theme.typography.scale.titleLg.fontSize,
            fontFamily: 'Anton_400Regular',
            letterSpacing: theme.typography.scale.titleLg.letterSpacing,
            textTransform: 'uppercase',
            alignSelf: 'flex-start',
          }}
        >
          {t('pomodoro.title')}
        </Text>

        <TimerDisplay
          remainingSeconds={remainingSeconds}
          phase={phase}
          cycleIndex={cycleIndex}
          cyclesPerRound={config.cyclesPerRound}
        />

        <PhaseIndicator cycleIndex={cycleIndex} cyclesPerRound={config.cyclesPerRound} />

        <TimerControls
          status={status}
          onStart={handleStart}
          onPause={pause}
          onResume={resume}
          onSkip={skipPhase}
          onReset={reset}
        />

        {(status === 'idle' || status === 'finished') && (
          <View style={{ width: '100%' }}>
            <PomodoroTargetPicker
              selectedHabitId={localHabitId}
              selectedTaskId={localTaskId}
              onSelectHabit={setLocalHabitId}
              onSelectTask={setLocalTaskId}
            />
          </View>
        )}

        {localHabitId && (
          <View
            style={[
              pomodoroSectionBase,
              {
                backgroundColor: theme.bg.surface,
                borderRadius: theme.radius.md,
                borderWidth: theme.borderWidth.default,
                borderColor: theme.border.default,
                padding: theme.spacing.stackMd,
              },
            ]}
          >
            <Text
              style={{
                color: theme.text.secondary,
                fontSize: theme.typography.scale.bodyMain.fontSize,
                fontFamily: 'Lexend_400Regular',
                flex: 1,
              }}
            >
              {t('pomodoro.auto_check_label')}
            </Text>
            <Switch
              value={autoCheckIn}
              onValueChange={setAutoCheckIn}
              trackColor={{ false: theme.border.default, true: theme.accent.muted }}
              thumbColor={autoCheckIn ? theme.accent.primary : theme.text.tertiary}
            />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
