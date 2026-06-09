import { Pressable, Text } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { usePomodoroStore } from "../usePomodoroStore";

interface PomodoroPillProps {
  onPress: () => void;
}

/**
 * Formats seconds remaining into MM:SS string.
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Floating pomodoro pill that displays the timer from usePomodoroStore.
 *
 * - Default display: "25:00"
 * - Dark rounded pill (bg-black text-white rounded-full)
 * - Shows `timer` icon (MaterialIcons) + time
 * - Position: absolute, bottom-right, above tab bar (bottom: 80)
 * - accessibilityLabel: "Pomodoro timer {time}"
 * - Tapping calls `onPress` (navigates to pomodoro tab via router)
 */
export function PomodoroPill({ onPress }: PomodoroPillProps) {
  const secondsRemaining = usePomodoroStore((s) => s.secondsRemaining);
  const time = formatTime(secondsRemaining);

  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-20 right-4 flex-row items-center gap-sm bg-black rounded-full px-4 py-2.5 shadow-lg active:opacity-80"
      accessibilityRole="button"
      accessibilityLabel={`Pomodoro timer ${time}`}
    >
      <MaterialIcons name="timer" size={18} color="white" />
      <Text className="text-white text-sm font-mono">{time}</Text>
    </Pressable>
  );
}
