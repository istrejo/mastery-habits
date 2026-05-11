/* stitch: progress-bar */
import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { useTheme } from '@core/theming';

interface ProgressBarProps {
  value: number;
  max?: number;
  scoreColor?: string;
  style?: ViewStyle;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  scoreColor,
  style,
  height = 8,
}) => {
  const t = useTheme();
  const pct = Math.min(Math.max(value / max, 0), 1);
  const fillColor = scoreColor ?? t.accent.primary;

  return (
    <View
      style={[
        {
          height,
          backgroundColor: t.accent.muted,
          borderRadius: t.radius.pill,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <View
        style={{
          width: `${pct * 100}%`,
          height: '100%',
          backgroundColor: fillColor,
          borderRadius: t.radius.pill,
        }}
      />
    </View>
  );
};
