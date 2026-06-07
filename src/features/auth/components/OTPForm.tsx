import { useRef, useState } from 'react';
import { View, type TextInput } from 'react-native';
import { OTPDigitInput } from './OTPDigitInput';

const OTP_LENGTH = 4;

interface OTPFormProps {
  onComplete: (code: string) => void;
}

export function OTPForm({ onComplete }: OTPFormProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const refs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const digit = text.slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < OTP_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }

    const code = next.join('');
    if (code.length === OTP_LENGTH && !code.includes('')) {
      onComplete(code);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="flex-row gap-md justify-center">
      {digits.map((digit, index) => (
        <OTPDigitInput
          key={index}
          ref={(el) => { refs.current[index] = el; }}
          value={digit}
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
