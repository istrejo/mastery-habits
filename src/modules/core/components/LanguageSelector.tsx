import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@core/theming';
import { useLocaleStore, type LocaleId } from '@core/i18n';

type LanguageOption = {
  value: LocaleId | null;
  flag: string;
  labelKey: 'settings.lang_es_subtitle' | 'settings.lang_en_subtitle' | 'settings.lang_system_subtitle';
  titleKey: 'language_picker.lang_es' | 'language_picker.lang_en' | 'language_picker.lang_system';
};

const OPTIONS: LanguageOption[] = [
  {
    value: 'es',
    flag: '🇦🇷',
    titleKey: 'language_picker.lang_es',
    labelKey: 'settings.lang_es_subtitle',
  },
  {
    value: 'en',
    flag: '🇺🇸',
    titleKey: 'language_picker.lang_en',
    labelKey: 'settings.lang_en_subtitle',
  },
  {
    value: null,
    flag: '📱',
    titleKey: 'language_picker.lang_system',
    labelKey: 'settings.lang_system_subtitle',
  },
];

export const LanguageSelector: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { locale, setLocale, clearLocale } = useLocaleStore();

  const handleSelect = (value: LocaleId | null) => {
    if (value === null) {
      clearLocale();
    } else {
      setLocale(value);
    }
  };

  return (
    <View style={{ gap: 2 }}>
      {OPTIONS.map((option, index) => {
        const isActive = locale === option.value;
        const isFirst = index === 0;
        const isLast = index === OPTIONS.length - 1;

        return (
          <Pressable
            key={String(option.value)}
            onPress={() => handleSelect(option.value)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 14,
              paddingHorizontal: 16,
              backgroundColor: pressed ? theme.bg.surfaceAlt : theme.bg.surface,
              borderWidth: theme.borderWidth.hairline,
              borderColor: isActive ? theme.accent.primary : theme.border.default,
              borderRadius: isFirst
                ? theme.radius.md
                : isLast
                ? theme.radius.md
                : 0,
              marginTop: isFirst ? 0 : -theme.borderWidth.hairline,
              zIndex: isActive ? 1 : 0,
            })}
          >
            <Text style={{ fontSize: 22, marginRight: 14 }}>{option.flag}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.text.primary, fontSize: 15, fontWeight: '600' }}>
                {t(option.titleKey)}
              </Text>
              <Text style={{ color: theme.text.tertiary, fontSize: 12, marginTop: 1 }}>
                {t(option.labelKey)}
              </Text>
            </View>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: theme.radius.pill,
                borderWidth: isActive ? 0 : theme.borderWidth.default,
                borderColor: theme.border.default,
                backgroundColor: isActive ? theme.accent.primary : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isActive && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: theme.radius.pill,
                    backgroundColor: theme.accent.onPrimary,
                  }}
                />
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};
