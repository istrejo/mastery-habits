import { TextInput, type TextInputProps } from 'react-native';

interface OTPDigitInputProps extends Omit<TextInputProps, 'maxLength' | 'keyboardType' | 'textAlign'> {
  value: string;
  isFocused?: boolean;
  ref?: React.Ref<TextInput>;
}

export function OTPDigitInput({ value, isFocused = false, ref, ...props }: OTPDigitInputProps) {
  return (
    <TextInput
      ref={ref}
      maxLength={1}
      keyboardType="number-pad"
      textAlign="center"
      value={value}
      className={`w-14 h-16 border rounded-lg text-display text-primary bg-surface-container-lowest ${
        isFocused ? 'border-primary' : 'border-outline'
      }`}
      placeholderTextColor="#c3c6d7"
      placeholder="·"
      {...props}
    />
  );
}
