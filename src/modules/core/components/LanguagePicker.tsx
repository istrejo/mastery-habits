import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@core/theming';
import { useLocaleStore, type LocaleId } from '@core/i18n';

const LOCALES: { id: LocaleId; flag: string; labelKey: 'language_picker.lang_es' | 'language_picker.lang_en' }[] = [
  { id: 'es', flag: '🇦🇷', labelKey: 'language_picker.lang_es' },
  { id: 'en', flag: '🇺🇸', labelKey: 'language_picker.lang_en' },
];

const activeIndicatorBase = {
  position: 'absolute' as const,
  top: 6,
  right: 6,
  width: 16,
  height: 16,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

export const LanguagePicker: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { locale, setLocale } = useLocaleStore();

  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {LOCALES.map(({ id, flag, labelKey }) => {
        const isActive = locale === id;
        return (
          <Pressable
            key={id}
            onPress={() => setLocale(id)}
            style={({ pressed }) => ({
              flex: 1,
              borderRadius: theme.radius.md,
              borderWidth: isActive ? theme.borderWidth.bold : theme.borderWidth.hairline,
              borderColor: isActive ? theme.accent.primary : theme.border.default,
              backgroundColor: theme.bg.surface,
              paddingVertical: 14,
              alignItems: 'center',
              gap: 6,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ fontSize: 28 }}>{flag}</Text>
            <Text style={{ color: theme.text.primary, fontSize: 13, fontWeight: '600' }}>
              {t(labelKey)}
            </Text>
            {isActive && (
              <View
                style={[
                  activeIndicatorBase,
                  {
                    borderRadius: theme.radius.pill,
                    backgroundColor: theme.accent.primary,
                  },
                ]}
              >
                <Text style={{ fontSize: 12, color: theme.accent.onPrimary, fontWeight: '800' }}>✓</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
};
