import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { TaskRow } from "./TaskRow";
import type { TaskWithSubTasks } from "../hooks/useTasksQuery";

interface TasksSectionProps {
  tasks: TaskWithSubTasks[];
  onToggleTask: (taskId: string) => void;
  onAddTask: () => void;
}

export function TasksSection({ tasks, onToggleTask, onAddTask }: TasksSectionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <View className="bg-surface-container rounded-xl p-4">
      {/* Section Header */}
      <TouchableOpacity
        className="flex-row items-center justify-between"
        onPress={() => setExpanded((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Collapse tasks" : "Expand tasks"}
      >
        <View className="flex-row items-center gap-2">
          <MaterialIcons
            name="checklist"
            size={24}
            color="var(--color-on-surface)"
          />
          <Text className="text-lg font-semibold text-on-surface">
            Tasks{tasks.length > 0 ? ` (${tasks.length})` : ""}
          </Text>
        </View>
        <MaterialIcons
          name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color="var(--color-on-surface-variant)"
        />
      </TouchableOpacity>

      {/* Task List */}
      {expanded && (
        <View className="mt-3 gap-2">
          {tasks.length === 0 ? (
            <Text className="text-on-surface-variant text-sm">No tasks for this day.</Text>
          ) : (
            tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={() => onToggleTask(task.id)}
                onAddSubtask={() => {}}
              />
            ))
          )}

          {/* Add Task Button */}
          <TouchableOpacity
            className="flex-row items-center gap-1 mt-2 py-2"
            onPress={onAddTask}
            accessibilityRole="button"
            accessibilityLabel="Add new task"
          >
            <MaterialIcons
              name="add"
              size={20}
              color="var(--color-primary)"
            />
            <Text className="text-primary font-medium">+ Add Task</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
