import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Checkbox } from "../../../shared/ui/Checkbox";
import { Task } from "../useTasksStore";
import { useSubTasksQuery } from "../hooks/useTasksQuery";
import { SubTaskRow } from "./SubTaskRow";
import { insertSubTask } from "../services/tasksService";
import { useQueryClient } from "@tanstack/react-query";
import { qk } from "../../../core/utils/queryKeys";

interface Props {
  task: Task;
  onToggle: (id: string, isCompleted: boolean) => void;
  togglingIds: Set<string>;
  userId: string;
  date: string;
}

export function TaskRow({ task, onToggle, togglingIds, userId, date }: Props) {
  const { subtasks, isLoading: subtasksLoading } = useSubTasksQuery(task.id);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();

  const isToggling = togglingIds.has(task.id);

  async function handleAddSubtask() {
    const title = inputValue.trim();
    if (!title) {
      setShowInput(false);
      return;
    }
    setIsAdding(true);
    try {
      await insertSubTask(task.id, title, userId, date);
      queryClient.invalidateQueries({ queryKey: qk.subtasks(task.id) });
      setInputValue("");
      setShowInput(false);
    } catch {
      // keep input open on error
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <View
      className="py-3"
      accessibilityRole="checkbox"
      accessibilityLabel={task.title}
      accessibilityState={{ checked: task.is_completed }}
    >
      {/* Main row */}
      <View className="flex-row items-start gap-3">
        <Checkbox
          checked={task.is_completed}
          onToggle={() => onToggle(task.id, !task.is_completed)}
          disabled={isToggling}
        />

        <View className="flex-1">
          {/* Title + priority badge */}
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text
              className={
                task.is_completed
                  ? "font-medium text-on-surface-variant line-through"
                  : "font-medium text-on-surface"
              }
            >
              {task.title}
            </Text>

            {task.priority === "high" && (
              <View className="bg-error-container rounded-full px-2 py-0.5">
                <Text className="text-on-error-container text-xs">
                  High Priority
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {!!task.description && (
            <Text className="text-on-surface-variant text-sm mt-0.5">
              {task.description}
            </Text>
          )}
        </View>
      </View>

      {/* Subtasks */}
      {subtasksLoading ? (
        <ActivityIndicator size="small" className="mt-2 ml-8" />
      ) : (
        subtasks.map((sub) => (
          <SubTaskRow
            key={sub.id}
            task={sub}
            onToggle={onToggle}
            disabled={togglingIds.has(sub.id)}
          />
        ))
      )}

      {/* Inline add-subtask */}
      {showInput ? (
        <View className="flex-row items-center gap-2 pl-8 mt-1">
          <TextInput
            autoFocus
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Sub-task title"
            className="flex-1 border-b border-outline text-on-surface py-1 text-sm"
            returnKeyType="done"
            onSubmitEditing={handleAddSubtask}
            onBlur={handleAddSubtask}
            editable={!isAdding}
          />
          {isAdding && <ActivityIndicator size="small" />}
        </View>
      ) : (
        <Pressable
          onPress={() => setShowInput(true)}
          className="mt-1 pl-8 active:opacity-60"
        >
          <Text className="text-secondary text-sm">+ Add sub-task</Text>
        </Pressable>
      )}
    </View>
  );
}
