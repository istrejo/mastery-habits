import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '@core/theming';
import { useTranslation } from 'react-i18next';
import { HABIT_CATEGORIES, type HabitCategoryId } from '../constants/categories';
import { CustomCategoryInput } from './CustomCategoryInput';

const categoryItemBase = {
  flex: 1,
  padding: 10,
  alignItems: 'center' as const,
  gap: 5,
};

interface CategoryPickerProps {
  value: HabitCategoryId;
  onChange: (id: HabitCategoryId) => void;
  customLabel?: string;
  customEmoji?: string;
  onCustomChange?: (data: { label: string; emoji: string }) => void;
}

const ROWS = [HABIT_CATEGORIES.slice(0, 3), HABIT_CATEGORIES.slice(3, 6), HABIT_CATEGORIES.slice(6, 9)] as const;

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
    <View style={{ gap: theme.spacing.stackSm }}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: 'row', gap: theme.spacing.stackSm }}>
          {row.map((cat) => {
            const isSelected = value === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => onChange(cat.id)}
                style={({ pressed }) => [
                  categoryItemBase,
                  {
                    backgroundColor: theme.bg.surface,
                    borderColor: isSelected ? theme.border.strong : theme.border.default,
                    borderWidth: isSelected ? theme.borderWidth.bold : theme.borderWidth.default,
                    borderRadius: theme.radius.md,
                  },
                  { opacity: pressed ? 0.78 : 1 },
                ]}
              >
                <Text style={{ fontSize: 24 }}>{cat.emoji}</Text>
                <Text
                  numberOfLines={1}
                  style={{
                    color: theme.text.primary,
                    fontSize: theme.typography.scale.microBold.fontSize,
                    fontFamily: 'Lexend_500Medium',
                    textAlign: 'center',
                  }}
                >
                  {t(`categories.${cat.id}.label` as any)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}

      {value === 'custom' && onCustomChange && (
        <CustomCategoryInput label={customLabel} emoji={customEmoji} onChange={onCustomChange} />
      )}
    </View>
  );
};
