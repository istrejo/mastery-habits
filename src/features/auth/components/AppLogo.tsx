import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function AppLogo() {
  return (
    <View className="flex-row items-center gap-xs">
      <Ionicons name="lock-closed" size={28} color="#004ac6" />
      <Text className="text-display text-primary font-bold tracking-tight">Pendie</Text>
    </View>
  );
}
