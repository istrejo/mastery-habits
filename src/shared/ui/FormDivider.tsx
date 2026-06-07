import { View, Text } from 'react-native';

interface FormDividerProps {
  label?: string;
}

export function FormDivider({ label = 'or' }: FormDividerProps) {
  return (
    <View className="flex-row items-center gap-sm my-xs">
      <View className="flex-1 h-px bg-outline-variant" />
      <Text className="text-body-md text-on-surface-variant">{label}</Text>
      <View className="flex-1 h-px bg-outline-variant" />
    </View>
  );
}
