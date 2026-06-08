import { View, Text } from "react-native";
import { useHabitsStore } from "../../src/features/habits/useHabitsStore";

export default function HabitsScreen() {
  const habits = useHabitsStore((s) => s.habits);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-gray-900">Habits</Text>
    </View>
  );
}
