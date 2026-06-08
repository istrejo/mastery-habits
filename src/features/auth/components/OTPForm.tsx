import { useRef, useState } from 'react';
import { View, type TextInput } from 'react-native';
import { OTPDigitInput } from './OTPDigitInput';

const OTP_LENGTH = 4;

type Digit = { id: string; value: string };

interface OTPFormProps {
  onComplete: (code: string) => void;
}

export function OTPForm({ onComplete }: OTPFormProps) {
  const [digits, setDigits] = useState<Digit[]>(() =>
    Array.from({ length: OTP_LENGTH }, (_, i) => ({ id: `digit-${i}`, value: '' }))
  );
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const refs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const value = text.slice(-1);
    const next = digits.map((d, i) => (i === index ? { ...d, value } : d));
    setDigits(next);

    if (value && index < OTP_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }

    const code = next.map((d) => d.value).join('');
    if (code.length === OTP_LENGTH && !code.includes('')) {
      onComplete(code);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index].value && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="flex-row gap-md justify-center">
      {digits.map((digit, index) => (
        <OTPDigitInput
          key={digit.id}
          ref={(el) => { refs.current[index] = el; }}
          value={digit.value}
          isFocused={focusedIndex === index}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(null)}
        />
      ))}
    </View>
  );
}
