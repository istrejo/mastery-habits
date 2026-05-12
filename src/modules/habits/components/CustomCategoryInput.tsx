import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theming';
import { useTranslation } from 'react-i18next';
import { Input } from '@core/components';

const QUICK_ICONS = ['✦', '◆', '■', '▲', '●', '✚', '✳', '⬢'];

interface CustomCategoryInputProps {
  label: string;
  emoji: string;
  onChange: (data: { label: string; emoji: string }) => void;
}

export const CustomCategoryInput: React.FC<CustomCategoryInputProps> = ({
  label,
  emoji,
  onChange,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ gap: theme.spacing.stackMd }}>
      <View style={{ gap: 8 }}>
        <Text
          style={{
            color: theme.text.secondary,
            fontSize: theme.typography.scale.microBold.fontSize,
            fontWeight: '500',
            fontFamily: 'Lexend_500Medium',
            letterSpacing: theme.typography.scale.microBold.letterSpacing,
            marginBottom: theme.spacing.stackSm,
          }}
        >
          {t('custom_category.emoji_label')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {QUICK_ICONS.map((e) => (
            <TouchableOpacity
              key={e}
              onPress={() => onChange({ label, emoji: e })}
              style={{
                backgroundColor: emoji === e ? theme.text.primary : theme.bg.surface,
                borderColor: theme.text.primary,
                borderWidth: theme.borderWidth.default,
                borderRadius: theme.radius.md,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: emoji === e ? theme.text.inverse : theme.text.primary,
                  fontFamily: 'Lexend_600SemiBold',
                }}
              >
                {e}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ gap: 4 }}>
        <Input
          label={t('custom_category.name_label')}
          value={label}
          onChangeText={(val) => onChange({ label: val, emoji })}
          placeholder={t('custom_category.name_placeholder')}
          maxLength={30}
          variant="underline"
        />
        <Text style={{ color: theme.text.tertiary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: 'Lexend_400Regular', textAlign: 'right' }}>
          {label.length}/30
        </Text>
      </View>
    </View>
  );
};
