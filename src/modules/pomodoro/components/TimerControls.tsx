import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@core/theming';
import { useTranslation } from 'react-i18next';
import type { TimerStatus } from '../types';

interface TimerControlsProps {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onReset: () => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  status,
  onStart,
  onPause,
  onResume,
  onSkip,
  onReset,
}) => {
  const t = useTheme();
  const { t: i18n } = useTranslation();

  const primaryBtnStyle = {
    backgroundColor: t.accent.primary,
    borderRadius: t.radius.pill,
    paddingHorizontal: t.spacing.stackLg,
    paddingVertical: t.spacing.stackMd,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    gap: t.spacing.stackSm,
  };

  const ghostBtnStyle = {
    padding: t.spacing.stackMd,
    borderRadius: t.radius.pill,
    borderWidth: t.borderWidth.default,
    borderColor: t.border.default,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  if (status === 'idle' || status === 'finished') {
    return (
      <View style={{ alignItems: 'center' }}>
        <Pressable onPress={onStart} style={({ pressed }) => [primaryBtnStyle, { opacity: pressed ? 0.8 : 1 }]}>
          <MaterialIcons name="play-arrow" size={22} color={t.accent.onPrimary} />
          <Text style={{ color: t.accent.onPrimary, fontFamily: 'Lexend_600SemiBold', fontSize: 15 }}>
            {i18n('pomodoro.controls.start')}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row', gap: t.spacing.stackMd, alignItems: 'center', justifyContent: 'center' }}>
      <Pressable onPress={onReset} style={({ pressed }) => [ghostBtnStyle, { opacity: pressed ? 0.8 : 1 }]}>
        <MaterialIcons name="stop" size={22} color={t.text.secondary} />
      </Pressable>

      {status === 'running' ? (
        <Pressable onPress={onPause} style={({ pressed }) => [primaryBtnStyle, { opacity: pressed ? 0.8 : 1 }]}>
          <MaterialIcons name="pause" size={22} color={t.accent.onPrimary} />
          <Text style={{ color: t.accent.onPrimary, fontFamily: 'Lexend_600SemiBold', fontSize: 15 }}>
            {i18n('pomodoro.controls.pause')}
          </Text>
        </Pressable>
      ) : (
        <Pressable onPress={onResume} style={({ pressed }) => [primaryBtnStyle, { opacity: pressed ? 0.8 : 1 }]}>
          <MaterialIcons name="play-arrow" size={22} color={t.accent.onPrimary} />
          <Text style={{ color: t.accent.onPrimary, fontFamily: 'Lexend_600SemiBold', fontSize: 15 }}>
            {i18n('pomodoro.controls.resume')}
          </Text>
        </Pressable>
      )}

      <Pressable onPress={onSkip} style={({ pressed }) => [ghostBtnStyle, { opacity: pressed ? 0.8 : 1 }]}>
        <MaterialIcons name="skip-next" size={22} color={t.text.secondary} />
      </Pressable>
    </View>
  );
};
