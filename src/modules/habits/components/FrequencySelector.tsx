import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theming';

const DAYS: { iso: number; label: string }[] = [
  { iso: 1, label: 'L' },
  { iso: 2, label: 'M' },
  { iso: 3, label: 'X' },
  { iso: 4, label: 'J' },
  { iso: 5, label: 'V' },
  { iso: 6, label: 'S' },
  { iso: 7, label: 'D' },
];

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
  const t = useTheme();

  const toggle = (iso: number) => {
    if (value.includes(iso)) {
      if (value.length === 1) return; // at least 1 day required
      onChange(value.filter((d) => d !== iso));
    } else {
      onChange([...value, iso].sort((a, b) => a - b));
    }
  };

  return (
    <View>
      <Text style={{ color: t.text.secondary, fontSize: 13, fontWeight: '500', marginBottom: 10 }}>
        Días
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {DAYS.map(({ iso, label }) => {
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
                borderRadius: t.radius.md,
                borderWidth: t.borderWidth.default,
                backgroundColor: active ? t.accent.primary : t.bg.surfaceAlt,
                borderColor: active ? t.accent.primary : t.border.default,
              }}
            >
              <Text
                style={{
                  color: active ? t.accent.onPrimary : t.text.secondary,
                  fontWeight: '600',
                  fontSize: 13,
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error ? (
        <Text style={{ color: t.status.danger, fontSize: 12, marginTop: 4 }}>{error}</Text>
      ) : null}
    </View>
  );
};
