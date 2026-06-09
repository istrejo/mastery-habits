import { Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { usePomodoroStore } from "../../pomodoro/usePomodoroStore";
import { formatTime } from "../../../core/utils/date";

export function PomodoroPill() {
  const router = useRouter();
  const secondsRemaining = usePomodoroStore((s) => s.secondsRemaining);

  return (
    <Pressable
      onPress={() => router.push("/(tabs)/pomodoro")}
      accessibilityRole="button"
      accessibilityLabel={`Pomodoro timer: ${formatTime(secondsRemaining)}. Tap to open.`}
      className="bg-on-surface px-4 py-2 rounded-full shadow-md"
    >
      <Text className="text-inverse-on-surface font-semibold text-sm">
        {formatTime(secondsRemaining)}
      </Text>
    </Pressable>
  );
}
