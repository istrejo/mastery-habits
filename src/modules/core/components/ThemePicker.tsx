import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@core/theming';

export const ThemePicker: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{
      backgroundColor: theme.bg.surface,
      borderColor: theme.border.default,
      borderWidth: theme.borderWidth.default,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.marginMobile,
      gap: theme.spacing.stackMd,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{
          color: theme.text.secondary,
          fontSize: theme.typography.scale.labelCaps.fontSize,
          fontFamily: 'Lexend_600SemiBold',
          letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
          textTransform: 'uppercase',
        }}>
          {t('settings.theme_section')}
        </Text>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.unit,
          backgroundColor: theme.accent.muted,
          borderRadius: theme.radius.pill,
          paddingHorizontal: 10,
          paddingVertical: 5,
        }}>
          <MaterialIcons name="check-circle" size={14} color={theme.accent.primary} />
          <Text style={{
            color: theme.text.primary,
            fontSize: theme.typography.scale.microBold.fontSize,
            fontFamily: 'Lexend_600SemiBold',
            letterSpacing: theme.typography.scale.microBold.letterSpacing,
            textTransform: 'uppercase',
          }}>
            {t('theme_picker.light_active')}
          </Text>
        </View>
      </View>

      <View style={{ gap: theme.spacing.stackSm }}>
        <Text style={{
          color: theme.text.primary,
          fontSize: theme.typography.scale.titleSm.fontSize,
          lineHeight: theme.typography.scale.titleSm.lineHeight,
          fontFamily: 'Anton_400Regular',
          letterSpacing: theme.typography.scale.titleSm.letterSpacing,
          textTransform: 'uppercase',
        }}>
          Mastery Habits Light
        </Text>
        <Text style={{
          color: theme.text.secondary,
          fontSize: theme.typography.scale.bodyMain.fontSize,
          lineHeight: theme.typography.scale.bodyMain.lineHeight,
          fontFamily: 'Lexend_400Regular',
        }}>
          {t('theme_picker.theming_soon_body')}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: theme.spacing.stackSm }}>
        {[theme.bg.base, theme.bg.surface, theme.accent.primary, theme.text.secondary].map((color) => (
          <View
            key={color}
            style={{
              width: 32,
              height: 32,
              borderRadius: theme.radius.pill,
              backgroundColor: color,
              borderWidth: theme.borderWidth.default,
              borderColor: theme.border.default,
            }}
          />
        ))}
      </View>
    </View>
  );
};
