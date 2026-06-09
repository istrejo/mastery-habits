import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function Header() {
  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <Ionicons name="calendar-outline" size={24} color="#434655" />
      <Text className="text-xl font-bold text-on-surface tracking-wide">
        Pendie
      </Text>
      <View className="w-8 h-8 rounded-full bg-surface-container-highest items-center justify-center">
        <Ionicons name="person-outline" size={18} color="#434655" />
      </View>
    </View>
  );
}
