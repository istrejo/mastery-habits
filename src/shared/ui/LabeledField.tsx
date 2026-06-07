import { View, Text, TextInput, type TextInputProps } from 'react-native';

interface LabeledFieldProps extends TextInputProps {
  label: string;
  error?: string;
  helper?: string;
  leadingIcon?: React.ReactNode;
  trailingElement?: React.ReactNode;
}

export function LabeledField({ label, error, helper, leadingIcon, trailingElement, ...inputProps }: LabeledFieldProps) {
  return (
    <View className="gap-xs">
      <Text className="text-label-md text-on-surface">{label}</Text>
      <View
        className={`flex-row items-center bg-surface-container-lowest border rounded px-sm py-sm ${
          error ? 'border-error' : 'border-outline'
        }`}
      >
        {leadingIcon ? <View className="mr-xs">{leadingIcon}</View> : null}
        <TextInput
          {...inputProps}
          className="flex-1 text-body-md text-on-surface"
          placeholderTextColor="#737686"
        />
        {trailingElement}
      </View>
      {error ? (
        <Text className="text-body-md text-error">{error}</Text>
      ) : helper ? (
        <Text className="text-body-md text-on-surface-variant">{helper}</Text>
      ) : null}
    </View>
  );
}
