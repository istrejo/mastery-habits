import React, { useEffect } from 'react';
import { type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  useAnimatedStyle,
  cancelAnimation,
} from 'react-native-reanimated';
import { useTheme } from '@core/theming';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 16, borderRadius, style }) => {
  const t = useTheme();
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 700 }),
        withTiming(0.45, { duration: 700 }),
      ),
      -1,
    );
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: borderRadius ?? t.radius.sm,
          backgroundColor: t.accent.muted,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};
