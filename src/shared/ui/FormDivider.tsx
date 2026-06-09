import { View, Text } from 'react-native';
import { useThemeColors } from '../../core/theme/useThemeColors';

interface FormDividerProps {
  label?: string;
}

export function FormDivider({ label = 'or' }: FormDividerProps) {
  const themeColors = useThemeColors();
  const dividerColor = themeColors['--color-outline-variant'];

  return (
    <View className="flex-row items-center gap-sm my-xs">
      <View className="flex-1 h-px" style={{ backgroundColor: dividerColor }} />
      <Text className="text-body-md text-on-surface-variant">{label}</Text>
      <View className="flex-1 h-px" style={{ backgroundColor: dividerColor }} />
    </View>
  );
}
