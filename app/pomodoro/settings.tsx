import { View, Text, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Screen } from '@core/components';
import { useTheme } from '@core/theming';
import { usePomodoroSettings } from '@pomodoro/index';

const settingsHeaderBase = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
};

export default function PomodoroSettingsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { config, updateConfig } = usePomodoroSettings();

  const fieldStyle = {
    backgroundColor: theme.bg.surfaceAlt,
    borderColor: theme.border.default,
    borderWidth: theme.borderWidth.default,
    borderRadius: theme.radius.md,
    padding: theme.spacing.stackMd,
    color: theme.text.primary,
    fontSize: theme.typography.scale.bodyMain.fontSize,
    fontFamily: 'Lexend_400Regular',
    textAlign: 'center' as const,
    width: 80,
  };

  const labelStyle = {
    color: theme.text.secondary,
    fontSize: theme.typography.scale.labelCaps.fontSize,
    fontFamily: 'Lexend_500Medium',
  };

  const rowStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: theme.spacing.stackSm,
    borderBottomWidth: theme.borderWidth.hairline,
    borderBottomColor: theme.border.subtle,
  };

  return (
    <Screen
      style={{ flex: 1 }}
      contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
    >
      <View style={{ flex: 1 }}>
        <View
          style={[
            settingsHeaderBase,
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
            style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
          >
            <MaterialIcons name="arrow-back" size={22} color={theme.text.primary} />
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
            {t('pomodoro.settings.title')}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={{ padding: theme.spacing.gutter, gap: theme.spacing.stackSm }}>
          <View style={rowStyle}>
            <Text style={labelStyle}>{t('pomodoro.settings.work_label')}</Text>
            <TextInput
              value={String(Math.round(config.workSeconds / 60))}
              onChangeText={(v) => {
                const mins = parseInt(v, 10);
                if (!isNaN(mins) && mins >= 1 && mins <= 90) updateConfig({ workSeconds: mins * 60 });
              }}
              keyboardType="numeric"
              style={fieldStyle}
            />
          </View>

          <View style={rowStyle}>
            <Text style={labelStyle}>{t('pomodoro.settings.short_break_label')}</Text>
            <TextInput
              value={String(Math.round(config.shortBreakSeconds / 60))}
              onChangeText={(v) => {
                const mins = parseInt(v, 10);
                if (!isNaN(mins) && mins >= 1 && mins <= 30) updateConfig({ shortBreakSeconds: mins * 60 });
              }}
              keyboardType="numeric"
              style={fieldStyle}
            />
          </View>

          <View style={rowStyle}>
            <Text style={labelStyle}>{t('pomodoro.settings.long_break_label')}</Text>
            <TextInput
              value={String(Math.round(config.longBreakSeconds / 60))}
              onChangeText={(v) => {
                const mins = parseInt(v, 10);
                if (!isNaN(mins) && mins >= 1 && mins <= 60) updateConfig({ longBreakSeconds: mins * 60 });
              }}
              keyboardType="numeric"
              style={fieldStyle}
            />
          </View>

          <View style={rowStyle}>
            <Text style={labelStyle}>{t('pomodoro.settings.cycles_per_round_label')}</Text>
            <TextInput
              value={String(config.cyclesPerRound)}
              onChangeText={(v) => {
                const n = parseInt(v, 10);
                if (!isNaN(n) && n >= 2 && n <= 8) updateConfig({ cyclesPerRound: n });
              }}
              keyboardType="numeric"
              style={fieldStyle}
            />
          </View>
        </View>
      </View>
    </Screen>
  );
}
