import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import { useTheme } from '@core/theming';

export type ToastVariant = 'error' | 'success' | 'info';

interface ToastProps {
  message: string | null;
  variant?: ToastVariant;
  onHide?: () => void;
  duration?: number;
}

const toastAnimatedBase = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  boxShadow: [{ offsetX: 0, offsetY: 4, blurRadius: 8, color: 'rgba(0, 0, 0, 0.15)' }] as const,
};

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = 'error',
  onHide,
  duration = 4000,
}) => {
  const theme = useTheme();
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-40);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideAndNotify = useCallback(() => {
    setCurrentMessage(null);
    onHide?.();
  }, [onHide]);

  const hideSilently = useCallback(() => {
    setCurrentMessage(null);
  }, []);

  useEffect(() => {
    if (hideTimer.current !== null) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }

    if (message) {
      setCurrentMessage(message);
      opacity.value = 0;
      translateY.value = -40;
      opacity.value = withTiming(1, { duration: 180 });
      translateY.value = withTiming(0, { duration: 220 });

      hideTimer.current = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 180 });
        translateY.value = withTiming(-40, { duration: 220 }, (finished) => {
          if (finished) {
            runOnJS(hideAndNotify)();
          }
        });
      }, duration);
    } else {
      opacity.value = withTiming(0, { duration: 180 });
      translateY.value = withTiming(-40, { duration: 220 }, (finished) => {
        if (finished) {
          runOnJS(hideSilently)();
        }
      });
    }

    return () => {
      if (hideTimer.current !== null) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
    };
  }, [message, duration, hideAndNotify, hideSilently, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!currentMessage) return null;

  const palette = {
    error: {
      bg: theme.status.danger,
      fg: theme.text.inverse,
      icon: '⚠',
    },
    success: {
      bg: theme.status.success,
      fg: theme.text.inverse,
      icon: '✓',
    },
    info: {
      bg: theme.bg.elevated,
      fg: theme.text.primary,
      icon: 'ℹ',
    },
  }[variant];

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: theme.spacing.stackMd,
        paddingTop: theme.spacing.stackMd,
        zIndex: 1000,
      }}
    >
      <Animated.View
        style={[
          toastAnimatedBase,
          {
            opacity,
            transform: [{ translateY }],
            backgroundColor: palette.bg,
            borderRadius: theme.radius.md,
            paddingVertical: theme.spacing.stackSm + 2,
            paddingHorizontal: theme.spacing.stackMd,
            gap: theme.spacing.stackSm,
            borderWidth: theme.borderWidth.default,
            borderColor: palette.bg,
          },
        ]}
      >
        <Text
          style={{
            color: palette.fg,
            fontSize: theme.typography.scale.bodyMain.fontSize,
            fontFamily: 'Lexend_600SemiBold',
          }}
        >
          {palette.icon}
        </Text>
        <Text
          style={{
            color: palette.fg,
            fontSize: theme.typography.scale.microBold.fontSize,
            fontFamily: 'Lexend_500Medium',
            flex: 1,
          }}
        >
          {currentMessage}
        </Text>
      </Animated.View>
    </View>
  );
};
