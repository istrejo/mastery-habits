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
  variant?: 'boxed' | 'underline';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  variant = 'boxed',
  ...rest
}) => {
  const t = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? t.status.danger
    : focused
      ? t.border.strong
      : t.border.default;

  const inputBase = variant === 'underline'
    ? {
        backgroundColor: 'transparent',
        borderBottomWidth: t.borderWidth.default,
        borderBottomColor: borderColor,
        borderRadius: 0,
        paddingVertical: t.spacing.stackSm + 2,
        paddingHorizontal: 0,
      }
    : {
        backgroundColor: t.bg.surface,
        borderWidth: t.borderWidth.default,
        borderColor,
        borderRadius: t.radius.md,
        paddingVertical: 13,
        paddingHorizontal: t.spacing.stackMd - 8,
      };

  return (
    <View style={containerStyle}>
      {label ? (
        <Text style={{
          color: t.text.secondary,
          fontSize: t.typography.scale.microBold.fontSize,
          fontWeight: '500',
          fontFamily: 'Lexend_500Medium',
          letterSpacing: t.typography.scale.microBold.letterSpacing,
          marginBottom: t.spacing.stackSm,
        }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        style={[
          {
            color: t.text.primary,
            fontFamily: 'Lexend_400Regular',
            fontSize: t.typography.scale.bodyMain.fontSize,
            lineHeight: t.typography.scale.bodyMain.lineHeight,
          },
          inputBase,
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
          fontFamily: 'Lexend_500Medium',
          marginTop: 6,
        }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};
