/* stitch: input */
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

  const borderBottomColor = error
    ? t.status.danger
    : focused
      ? t.accent.primary
      : t.border.default;

  return (
    <View style={containerStyle}>
      {label ? (
        <Text style={{
          color: t.text.secondary,
          fontSize: t.typography.scale.labelCaps.fontSize,
          fontWeight: '600',
          fontFamily: 'Inter_600SemiBold',
          letterSpacing: t.typography.scale.labelCaps.letterSpacing,
          textTransform: 'uppercase',
          marginBottom: t.spacing.stackSm,
        }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        style={[
          {
            backgroundColor: 'transparent',
            borderBottomWidth: t.borderWidth.default,
            borderBottomColor,
            borderRadius: 0,
            color: t.text.primary,
            fontFamily: 'Inter_400Regular',
            fontSize: t.typography.scale.bodyMain.fontSize,
            paddingVertical: t.spacing.stackSm,
            paddingHorizontal: 0,
          },
          style,
        ]}
        placeholderTextColor={t.text.tertiary}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
      />
      {error ? (
        <Text style={{
          color: t.status.danger,
          fontSize: t.typography.scale.microBold.fontSize,
          fontFamily: 'Inter_500Medium',
          marginTop: 4,
        }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};
