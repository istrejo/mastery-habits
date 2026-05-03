import React, { useEffect, useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';
import { useTheme } from '@core/theming';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 16, borderRadius, style }) => {
  const t = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: borderRadius ?? t.radius.sm,
          backgroundColor: t.bg.surfaceAlt,
          opacity,
        },
        style,
      ]}
    />
  );
};
