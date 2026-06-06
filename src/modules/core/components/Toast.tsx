import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { useTheme } from '@core/theming';

export type ToastVariant = 'error' | 'success' | 'info';

interface ToastProps {
  message: string | null;
  variant?: ToastVariant;
  onHide?: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = 'error',
  onHide,
  duration = 4000,
}) => {
  const theme = useTheme();
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-40)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeOutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (hideTimer.current !== null) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    if (fadeOutTimer.current !== null) {
      clearTimeout(fadeOutTimer.current);
      fadeOutTimer.current = null;
    }

    if (message) {
      setCurrentMessage(message);
      opacity.setValue(0);
      translateY.setValue(-40);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      hideTimer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -40,
            duration: 220,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setCurrentMessage(null);
          onHide?.();
        });
      }, duration);
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -40,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentMessage(null);
      });
    }

    return () => {
      if (hideTimer.current !== null) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
      if (fadeOutTimer.current !== null) {
        clearTimeout(fadeOutTimer.current);
        fadeOutTimer.current = null;
      }
    };
  }, [message, duration, onHide, opacity, translateY]);

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
        style={{
          opacity,
          transform: [{ translateY }],
          backgroundColor: palette.bg,
          borderRadius: theme.radius.md,
          paddingVertical: theme.spacing.stackSm + 2,
          paddingHorizontal: theme.spacing.stackMd,
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.stackSm,
          borderWidth: theme.borderWidth.default,
          borderColor: palette.bg,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 6,
        }}
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
