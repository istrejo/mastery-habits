import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theming';
import { useTranslation } from 'react-i18next';
import { HABIT_CATEGORIES, type HabitCategoryId } from '../constants/categories';
import { CustomCategoryInput } from './CustomCategoryInput';

interface CategoryPickerProps {
  value: HabitCategoryId;
  onChange: (id: HabitCategoryId) => void;
  customLabel?: string;
  customEmoji?: string;
  onCustomChange?: (data: { label: string; emoji: string }) => void;
}

const ROWS = [
  HABIT_CATEGORIES.slice(0, 3),
  HABIT_CATEGORIES.slice(3, 6),
  HABIT_CATEGORIES.slice(6, 9),
] as const;

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  value,
  onChange,
  customLabel = '',
  customEmoji = '✨',
  onCustomChange,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ gap: 8 }}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: 'row', gap: 8 }}>
          {row.map((cat) => {
            const isSelected = value === cat.id;
            const colors = theme.categoryColors[cat.colorToken];

            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => onChange(cat.id)}
                style={{
                  flex: 1,
                  backgroundColor: isSelected ? colors.bg : theme.bg.surfaceAlt,
                  borderColor: isSelected ? colors.border : theme.border.default,
                  borderWidth: isSelected ? theme.borderWidth.bold : theme.borderWidth.default,
                  borderRadius: theme.radius.md,
                  padding: 10,
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {isSelected && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      backgroundColor: colors.border,
                      borderRadius: 999,
                      width: 14,
                      height: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: colors.fg, fontSize: 8, fontWeight: '700', lineHeight: 14 }}>
                      ✓
                    </Text>
                  </View>
                )}
                <Text style={{ fontSize: 26 }}>{cat.emoji}</Text>
                <Text
                  style={{
                    color: isSelected ? colors.fg : theme.text.primary,
                    fontSize: 10,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}
                >
                  {t(`categories.${cat.id}.label` as any)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {value === 'custom' && onCustomChange && (
        <CustomCategoryInput
          label={customLabel}
          emoji={customEmoji}
          onChange={onCustomChange}
        />
      )}
    </View>
  );
};
