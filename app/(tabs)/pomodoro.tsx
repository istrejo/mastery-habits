import { View, Text } from "react-native";
import { usePomodoroStore } from "../../src/features/pomodoro/usePomodoroStore";

export default function PomodoroScreen() {
  const status = usePomodoroStore((s) => s.status);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-gray-900">Pomodoro</Text>
    </View>
  );
}
