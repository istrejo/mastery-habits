import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@core/theming';

interface FrequencySelectorProps {
  value: number[];
  onChange: (days: number[]) => void;
  error?: string;
}

export const FrequencySelector: React.FC<FrequencySelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const DAYS: { iso: number; labelKey: `frequency.day_mon` | `frequency.day_tue` | `frequency.day_wed` | `frequency.day_thu` | `frequency.day_fri` | `frequency.day_sat` | `frequency.day_sun` }[] = [
    { iso: 1, labelKey: 'frequency.day_mon' },
    { iso: 2, labelKey: 'frequency.day_tue' },
    { iso: 3, labelKey: 'frequency.day_wed' },
    { iso: 4, labelKey: 'frequency.day_thu' },
    { iso: 5, labelKey: 'frequency.day_fri' },
    { iso: 6, labelKey: 'frequency.day_sat' },
    { iso: 7, labelKey: 'frequency.day_sun' },
  ];

  const toggle = (iso: number) => {
    if (value.includes(iso)) {
      if (value.length === 1) return;
      onChange(value.filter((d) => d !== iso));
    } else {
      onChange([...value, iso].sort((a, b) => a - b));
    }
  };

  return (
    <View>
      <Text style={{ color: theme.text.secondary, fontSize: 13, fontWeight: '500', marginBottom: 10 }}>
        {t('frequency.label')}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {DAYS.map(({ iso, labelKey }) => {
          const active = value.includes(iso);
          return (
            <TouchableOpacity
              key={iso}
              onPress={() => toggle(iso)}
              style={{
                flex: 1,
                aspectRatio: 1,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.radius.md,
                borderWidth: theme.borderWidth.default,
                backgroundColor: active ? theme.accent.primary : theme.bg.surfaceAlt,
                borderColor: active ? theme.accent.primary : theme.border.default,
              }}
            >
              <Text
                style={{
                  color: active ? theme.accent.onPrimary : theme.text.secondary,
                  fontWeight: '600',
                  fontSize: 13,
                }}
              >
                {t(labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error ? (
        <Text style={{ color: theme.status.danger, fontSize: 12, marginTop: 4 }}>{error}</Text>
      ) : null}
    </View>
  );
};
