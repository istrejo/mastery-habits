import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theming';
import { useTranslation } from 'react-i18next';
import { Input } from '@core/components';

const QUICK_EMOJIS = ['⭐', '🎯', '🔥', '💎', '🚀', '🌟', '💡', '⚙️'];

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
    <View style={{ gap: 12 }}>
      <View style={{ gap: 8 }}>
        <Input
          label={t('custom_category.emoji_label')}
          value={emoji}
          onChangeText={(val) => onChange({ label, emoji: val })}
          placeholder="✨"
          maxLength={8}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {QUICK_EMOJIS.map((e) => (
            <TouchableOpacity
              key={e}
              onPress={() => onChange({ label, emoji: e })}
              style={{
                backgroundColor: theme.bg.surface,
                borderColor: emoji === e ? theme.border.strong : theme.border.default,
                borderWidth: emoji === e ? theme.borderWidth.bold : theme.borderWidth.default,
                borderRadius: theme.radius.md,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text style={{ fontSize: 20 }}>{e}</Text>
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
        />
        <Text style={{ color: theme.text.tertiary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: 'Lexend_400Regular', textAlign: 'right' }}>
          {label.length}/30
        </Text>
      </View>
    </View>
  );
};
