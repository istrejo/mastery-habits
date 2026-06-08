import { useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, Animated, type TextInputProps } from 'react-native';

interface FloatingLabelFieldProps extends TextInputProps {
  label: string;
  error?: string;
  trailingElement?: React.ReactNode;
}

export function FloatingLabelField({ label, error, trailingElement, value, onFocus, onBlur, ...inputProps }: FloatingLabelFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;
  const focusColor = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const animate = (toProgress: number, toColor: number) => {
    Animated.parallel([
      Animated.timing(progress, { toValue: toProgress, duration: 150, useNativeDriver: false }),
      Animated.timing(focusColor, { toValue: toColor, duration: 150, useNativeDriver: false }),
    ]).start();
  };

  const handleFocus = (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
    setIsFocused(true);
    animate(1, 1);
    onFocus?.(e);
  };

  const handleBlur = (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
    setIsFocused(false);
    animate(value ? 1 : 0, 0);
    onBlur?.(e);
  };

  const top = progress.interpolate({ inputRange: [0, 1], outputRange: [16, 6] });
  const fontSize = progress.interpolate({ inputRange: [0, 1], outputRange: [16, 11] });
  const color = focusColor.interpolate({ inputRange: [0, 1], outputRange: ['#737686', '#004ac6'] });

  return (
    <View>
      <Pressable onPress={() => inputRef.current?.focus()}>
        <View
          className={`relative border rounded-lg px-md pt-6 pb-2 bg-transparent ${
            error ? 'border-error' : isFocused ? 'border-primary' : 'border-outline'
          }`}
          style={isFocused ? { borderWidth: 2 } : undefined}
        >
          <Animated.Text
            className="absolute left-4 z-10 bg-transparent"
            style={{ top, fontSize, color }}
          >
            {label}
          </Animated.Text>
          <TextInput
            ref={inputRef}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="text-body-lg text-on-surface"
            placeholderTextColor="transparent"
            {...inputProps}
          />
          {trailingElement ? (
            <View className="absolute right-3 top-1/2 -translate-y-2">
              {trailingElement}
            </View>
          ) : null}
        </View>
      </Pressable>
      {error ? (
        <Text className="text-body-md text-error mt-xs">{error}</Text>
      ) : null}
    </View>
  );
}
