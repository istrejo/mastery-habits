import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@core/theming';
import { useTranslation } from 'react-i18next';
import { formatTime } from '../utils/formatTime';
import type { PomodoroPhase } from '../types';

interface TimerDisplayProps {
  remainingSeconds: number;
  phase: PomodoroPhase;
  cycleIndex: number;
  cyclesPerRound: number;
}

const timerCircleBase = {
  width: 220,
  height: 220,
  borderWidth: 6,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

const PHASE_COLORS: Record<PomodoroPhase, 'accent' | 'success' | 'info'> = {
  work: 'accent',
  short_break: 'success',
  long_break: 'info',
};

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  remainingSeconds,
  phase,
  cycleIndex,
  cyclesPerRound,
}) => {
  const t = useTheme();
  const { t: i18n } = useTranslation();

  const phaseKey = PHASE_COLORS[phase];
  const ringColor = phaseKey === 'accent' ? t.accent.primary : phaseKey === 'success' ? t.status.success : t.status.info;

  return (
    <View style={{ alignItems: 'center', gap: t.spacing.stackMd }}>
      <View
        style={[
          timerCircleBase,
          {
            borderRadius: t.radius.pill,
            borderColor: ringColor,
            backgroundColor: t.bg.surface,
          },
        ]}
      >
        <Text
          style={{
            color: t.text.primary,
            fontSize: 56,
            fontFamily: 'Anton_400Regular',
            letterSpacing: 2,
            fontVariant: ['tabular-nums'],
          }}
        >
          {formatTime(remainingSeconds)}
        </Text>
        <Text
          style={{
            color: ringColor,
            fontSize: t.typography.scale.labelCaps.fontSize,
            fontFamily: 'Lexend_600SemiBold',
            letterSpacing: t.typography.scale.labelCaps.letterSpacing,
            textTransform: 'uppercase',
            marginTop: 4,
          }}
        >
          {i18n(`pomodoro.phases.${phase}`)}
        </Text>
      </View>

      <Text
        style={{
          color: t.text.tertiary,
          fontSize: t.typography.scale.microBold.fontSize,
          fontFamily: 'Lexend_400Regular',
        }}
      >
        {i18n('pomodoro.cycle_indicator', { current: cycleIndex, total: cyclesPerRound })}
      </Text>
    </View>
  );
};
