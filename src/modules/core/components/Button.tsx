/* stitch: button */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  type ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@core/theming';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  iconRight?: keyof typeof MaterialIcons.glyphMap;
  iconLeft?: keyof typeof MaterialIcons.glyphMap;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  iconRight,
  iconLeft,
}) => {
  const t = useTheme();

  const iconSizeMap: Record<ButtonSize, number> = { sm: 16, md: 18, lg: 20 };
  const paddingMap: Record<ButtonSize, { v: number; h: number }> = {
    sm: { v: 9,  h: 14 },
    md: { v: 13, h: 20 },
    lg: { v: 16, h: 24 },
  };
  const fontSizeMap: Record<ButtonSize, number> = { sm: 12, md: 14, lg: 16 };

  const pad = paddingMap[size];

  const bgColor = {
    primary: t.accent.primary,
    secondary: 'transparent',
    ghost: 'transparent',
    danger: t.status.danger,
  }[variant];

  const textColor = {
    primary: t.accent.onPrimary,
    secondary: t.text.primary,
    ghost: t.text.secondary,
    danger: t.text.inverse,
  }[variant];

  const borderProps: ViewStyle =
    variant === 'secondary'
      ? { borderWidth: t.borderWidth.default, borderColor: t.border.strong }
      : variant === 'ghost'
        ? { borderWidth: t.borderWidth.default, borderColor: 'transparent' }
        : {};

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.78}
      style={[
        {
          backgroundColor: bgColor,
          borderRadius: t.radius.md,
          paddingVertical: pad.v,
          paddingHorizontal: pad.h,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.45 : 1,
        },
        borderProps,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.unit * 2 }}>
          {iconLeft && <MaterialIcons name={iconLeft} size={iconSizeMap[size]} color={textColor} />}
          <Text style={{
            color: textColor,
            fontWeight: '600',
            fontSize: fontSizeMap[size],
            fontFamily: 'Lexend_600SemiBold',
            letterSpacing: 0.7,
            textTransform: 'uppercase',
          }}>
            {label}
          </Text>
          {iconRight && <MaterialIcons name={iconRight} size={iconSizeMap[size]} color={textColor} />}
        </View>
      )}
    </TouchableOpacity>
  );
};
