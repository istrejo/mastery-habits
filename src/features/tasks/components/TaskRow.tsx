import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { TaskWithSubTasks } from "../hooks/useTasksQuery";

interface TaskRowProps {
  task: TaskWithSubTasks;
  onToggle: () => void;
  onAddSubtask: () => void;
}

export function TaskRow({ task, onToggle, onAddSubtask }: TaskRowProps) {
  return (
    <View className="flex-row items-start gap-3 py-2">
      {/* Checkbox */}
      <TouchableOpacity
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityLabel={`Toggle ${task.title}`}
        accessibilityState={{ checked: task.is_completed }}
      >
        <MaterialIcons
          name={task.is_completed ? "check-circle" : "radio-button-unchecked"}
          size={24}
          color={task.is_completed ? "var(--color-primary)" : "var(--color-on-surface-variant)"}
        />
      </TouchableOpacity>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text
            className={`text-base ${
              task.is_completed ? "text-muted-foreground line-through" : "text-foreground"
            }`}
          >
            {task.title}
          </Text>
          {task.priority === "high" && (
            <View className="bg-destructive/10 px-2 py-0.5 rounded-full">
              <Text className="text-destructive text-xs font-medium">High Priority</Text>
            </View>
          )}
        </View>

        {task.description && (
          <Text className="text-muted-foreground text-sm mt-0.5" numberOfLines={2}>
            {task.description}
          </Text>
        )}

        {task.subtasks.length > 0 && (
          <Text className="text-muted-foreground text-xs mt-1">
            {task.subtasks.length} subtask{task.subtasks.length !== 1 ? "s" : ""}
          </Text>
        )}
      </View>
    </View>
  );
}
