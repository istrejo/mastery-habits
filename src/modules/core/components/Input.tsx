import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@core/theming';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...rest
}) => {
  const t = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? t.status.danger
    : focused
      ? t.accent.primary
      : t.border.default;

  return (
    <View style={containerStyle}>
      {label ? (
        <Text
          style={{ color: t.text.secondary, fontSize: 13, marginBottom: 6, fontWeight: '500' }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        style={[
          {
            backgroundColor: t.bg.surfaceAlt,
            borderColor,
            borderWidth: t.borderWidth.default,
            borderRadius: t.radius.md,
            color: t.text.primary,
            paddingVertical: 12,
            paddingHorizontal: 14,
            fontSize: 15,
          },
          style,
        ]}
        placeholderTextColor={t.text.tertiary}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
      />
      {error ? (
        <Text style={{ color: t.status.danger, fontSize: 12, marginTop: 4 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};
