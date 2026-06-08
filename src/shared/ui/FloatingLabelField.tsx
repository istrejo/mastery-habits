import { useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, type TextInputProps } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';

interface FloatingLabelFieldProps extends TextInputProps {
  label: string;
  error?: string;
  trailingElement?: React.ReactNode;
}

export function FloatingLabelField({ label, error, trailingElement, value, onFocus, onBlur, ...inputProps }: FloatingLabelFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const progress = useSharedValue(value ? 1 : 0);
  const focusColor = useSharedValue(0);
  const inputRef = useRef<TextInput>(null);

  const handleFocus = (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
    setIsFocused(true);
    progress.value = withTiming(1, { duration: 150 });
    focusColor.value = withTiming(1, { duration: 150 });
    onFocus?.(e);
  };

  const handleBlur = (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
    setIsFocused(false);
    if (!value) {
      progress.value = withTiming(0, { duration: 150 });
    }
    focusColor.value = withTiming(0, { duration: 150 });
    onBlur?.(e);
  };

  const animatedLabelStyle = useAnimatedStyle(() => ({
    top: interpolate(progress.value, [0, 1], [16, 6]),
    fontSize: interpolate(progress.value, [0, 1], [16, 11]),
    color: interpolateColor(focusColor.value, [0, 1], ['#737686', '#004ac6']),
  }));

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
            style={animatedLabelStyle}
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
