import { View, Text } from "react-native";
import { Checkbox } from "../../../shared/ui/Checkbox";
import { Task } from "../useTasksStore";

interface Props {
  task: Task;
  onToggle: (id: string, isCompleted: boolean) => void;
  disabled?: boolean;
}

export function SubTaskRow({ task, onToggle, disabled = false }: Props) {
  return (
    <View
      className="flex-row items-center gap-2 py-2 pl-8"
      accessibilityRole="checkbox"
      accessibilityState={{ checked: task.is_completed }}
      accessibilityLabel={task.title}
    >
      <Checkbox
        checked={task.is_completed}
        onToggle={() => onToggle(task.id, !task.is_completed)}
        disabled={disabled}
      />
      <Text
        className={
          task.is_completed
            ? "text-on-surface-variant line-through flex-1"
            : "text-on-surface flex-1"
        }
      >
        {task.title}
      </Text>
    </View>
  );
}
