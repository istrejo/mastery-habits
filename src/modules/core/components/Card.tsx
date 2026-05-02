import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useTheme } from '@core/theming';

interface CardProps extends ViewProps {
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  elevated = false,
  style,
  children,
  ...rest
}) => {
  const t = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: elevated ? t.bg.elevated : t.bg.surface,
          borderColor: t.border.default,
          borderWidth: t.borderWidth.hairline,
          borderRadius: t.radius.lg,
          padding: 14,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};
