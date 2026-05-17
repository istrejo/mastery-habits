import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  ENABLED_THEME_IDS,
  THEMES,
  useTheme,
  useThemeStore,
  type EnabledThemeId,
} from '@core/theming';

const THEME_COPY: Record<
  EnabledThemeId,
  { nameKey: string; descriptionKey: string }
> = {
  'minimal-light': {
    nameKey: 'theme_picker.light_name',
    descriptionKey: 'theme_picker.light_description',
  },
  'minimal-dark': {
    nameKey: 'theme_picker.dark_name',
    descriptionKey: 'theme_picker.dark_description',
  },
};

export const ThemePicker: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const themeId = useThemeStore((state) => state.themeId);
  const setTheme = useThemeStore((state) => state.setTheme);
  const activeTheme = THEME_COPY[themeId];

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
            {t(activeTheme.nameKey)}
          </Text>
        </View>
      </View>

      <View style={{ gap: theme.spacing.stackSm }}>
        {ENABLED_THEME_IDS.map((optionId) => {
          const optionTheme = THEMES[optionId];
          const copy = THEME_COPY[optionId];
          const isActive = optionId === themeId;

          return (
            <Pressable
              key={optionId}
              onPress={() => setTheme(optionId)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              style={({ pressed }) => ({
                gap: theme.spacing.stackSm,
                padding: theme.spacing.marginMobile,
                borderRadius: theme.radius.lg,
                borderWidth: theme.borderWidth.default,
                borderColor: isActive ? theme.border.strong : theme.border.default,
                backgroundColor: pressed || isActive ? theme.bg.surfaceAlt : theme.bg.base,
              })}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: theme.spacing.stackMd }}>
                <View style={{ flex: 1, gap: theme.spacing.stackSm }}>
                  <Text style={{
                    color: theme.text.primary,
                    fontSize: theme.typography.scale.titleSm.fontSize,
                    lineHeight: theme.typography.scale.titleSm.lineHeight,
                    fontFamily: 'Anton_400Regular',
                    letterSpacing: theme.typography.scale.titleSm.letterSpacing,
                    textTransform: 'uppercase',
                  }}>
                    {t(copy.nameKey)}
                  </Text>
                  <Text style={{
                    color: theme.text.secondary,
                    fontSize: theme.typography.scale.bodyMain.fontSize,
                    lineHeight: theme.typography.scale.bodyMain.lineHeight,
                    fontFamily: 'Lexend_400Regular',
                  }}>
                    {t(copy.descriptionKey)}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end', gap: theme.spacing.stackSm }}>
                  {isActive ? (
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
                        {t('theme_picker.active_badge')}
                      </Text>
                    </View>
                  ) : null}
                  <MaterialIcons
                    name={isActive ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={18}
                    color={isActive ? theme.text.primary : theme.text.secondary}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: theme.spacing.stackSm }}>
                {[
                  optionTheme.bg.base,
                  optionTheme.bg.surface,
                  optionTheme.accent.primary,
                  optionTheme.text.secondary,
                ].map((color, index) => (
                  <View
                    key={`${optionId}-${color}-${index}`}
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
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
