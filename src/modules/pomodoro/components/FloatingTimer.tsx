import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@core/theming';
import { useTranslation } from 'react-i18next';
import { usePomodoroStore } from '../states/pomodoro.store';
import { useTimerTick } from '../hooks/useTimerTick';
import { formatTime } from '../utils/formatTime';

const TAB_BAR_HEIGHT = 60;

export const FloatingTimer: React.FC = () => {
  const t = useTheme();
  const { t: i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const status = usePomodoroStore((s) => s.status);
  const phase = usePomodoroStore((s) => s.phase);
  const remainingSeconds = useTimerTick();

  if (status === 'idle') return null;

  const phaseColor =
    phase === 'work' ? t.accent.primary : phase === 'short_break' ? t.status.success : t.status.info;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        bottom: TAB_BAR_HEIGHT + insets.bottom + 8,
        left: 0,
        right: 0,
        alignItems: 'center',
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push('/(tabs)/pomodoro')}
        accessibilityLabel={i18n('pomodoro.floating.a11y_label')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.spacing.stackSm,
          backgroundColor: t.bg.elevated,
          borderWidth: t.borderWidth.default,
          borderColor: phaseColor,
          borderRadius: t.radius.pill,
          paddingHorizontal: t.spacing.stackMd,
          paddingVertical: t.spacing.stackSm,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.18,
          shadowRadius: 6,
          elevation: 6,
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: t.radius.pill,
            backgroundColor: phaseColor,
          }}
        />
        <Text
          style={{
            color: t.text.primary,
            fontFamily: 'Anton_400Regular',
            fontSize: 16,
            letterSpacing: 1,
            fontVariant: ['tabular-nums'],
          }}
        >
          {formatTime(remainingSeconds)}
        </Text>
        <Text
          style={{
            color: t.text.secondary,
            fontSize: t.typography.scale.microBold.fontSize,
            fontFamily: 'Lexend_500Medium',
            letterSpacing: t.typography.scale.labelCaps.letterSpacing,
            textTransform: 'uppercase',
          }}
        >
          {i18n(`pomodoro.phases.${phase}`)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
