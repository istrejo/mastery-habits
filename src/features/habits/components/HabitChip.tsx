import { Pressable, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { HabitWithCompletion } from "../hooks/useHabitsQuery";

interface HabitChipProps {
  habit: HabitWithCompletion;
  onToggle: () => void;
}

/**
 * Single habit chip with check state and color accent.
 *
 * - Checked: full check_circle icon
 * - Unchecked: radio_button_unchecked icon
 * - Tapping calls onToggle
 * - accessibilityLabel: "Toggle {habit.title}"
 */
export function HabitChip({ habit, onToggle }: HabitChipProps) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityLabel={`Toggle ${habit.title}`}
      accessibilityState={{ checked: habit.completed }}
      className={`flex-row items-center gap-sm rounded-full px-4 py-2 mr-2 ${
        habit.completed ? "bg-primary-container" : "bg-surface-variant"
      }`}
    >
      <MaterialIcons
        name={habit.completed ? "check-circle" : "radio-button-unchecked"}
        size={20}
        color={habit.color ?? undefined}
      />
      <Text className="text-on-surface text-body-md">{habit.title}</Text>
    </Pressable>
  );
}
