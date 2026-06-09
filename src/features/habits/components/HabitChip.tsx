import { Pressable, Text, View } from "react-native";
import { Checkbox } from "../../../shared/ui/Checkbox";
import { HabitWithCompletion } from "../hooks/useHabitsQuery";

interface Props {
  habit: HabitWithCompletion;
  onToggle: () => void;
  disabled?: boolean;
}

export function HabitChip({ habit, onToggle, disabled = false }: Props) {
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityLabel={habit.title}
      accessibilityState={{ checked: habit.completed }}
      className={`flex-row items-center gap-2 px-3 py-2 rounded-full border ${
        habit.completed
          ? "bg-secondary-container border-secondary"
          : "bg-surface-container-low border-outline-variant"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <View
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: habit.color ?? "#006c49" }}
      />
      <Checkbox checked={habit.completed} onToggle={onToggle} disabled={disabled} />
      <Text className="text-on-surface text-sm">{habit.title}</Text>
    </Pressable>
  );
}
