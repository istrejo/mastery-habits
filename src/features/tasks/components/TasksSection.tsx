import { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Task } from "../useTasksStore";
import { TaskRow } from "./TaskRow";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  tasks: Task[];
  togglingIds: Set<string>;
  onToggle: (id: string, isCompleted: boolean) => void;
  onAddTask: () => void;
  isLoading: boolean;
  userId: string;
  date: string;
}

function PlaceholderRow() {
  return (
    <View className="flex-row items-center gap-3 py-3">
      <View className="w-6 h-6 rounded-sm bg-surface-variant opacity-50" />
      <View className="flex-1 h-4 rounded bg-surface-variant opacity-50" />
    </View>
  );
}

export function TasksSection({
  tasks,
  togglingIds,
  onToggle,
  onAddTask,
  isLoading,
  userId,
  date,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  function toggleCollapse() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsed((v) => !v);
  }

  return (
    <View>
      {/* Section header */}
      <View className="flex-row items-center justify-between mb-2">
        <Pressable
          onPress={toggleCollapse}
          className="flex-row items-center gap-1 active:opacity-70"
        >
          <Text className="text-on-surface font-semibold text-base">Tasks</Text>
          <Ionicons
            name={collapsed ? "chevron-forward" : "chevron-down"}
            size={16}
            color="#0b1c30"
          />
        </Pressable>

        <Pressable
          onPress={onAddTask}
          className="w-8 h-8 items-center justify-center rounded-full active:bg-surface-variant"
          accessibilityLabel="Add task"
          accessibilityRole="button"
        >
          <Ionicons name="add-outline" size={22} color="#004ac6" />
        </Pressable>
      </View>

      {/* Body */}
      {!collapsed && (
        <View>
          {isLoading ? (
            <>
              <PlaceholderRow />
              <PlaceholderRow />
            </>
          ) : tasks.length === 0 ? (
            <View className="items-center py-8 gap-3">
              <Text className="text-on-surface-variant text-sm">
                No tasks for today
              </Text>
              <Pressable
                onPress={onAddTask}
                className="px-4 py-2 border border-outline rounded active:opacity-70"
              >
                <Text className="text-primary text-sm font-medium">
                  Add your first task
                </Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={tasks}
              keyExtractor={(t) => t.id}
              renderItem={useCallback(({ item }: { item: Task }) => (
                <TaskRow
                  task={item}
                  onToggle={onToggle}
                  togglingIds={togglingIds}
                  userId={userId}
                  date={date}
                />
              ), [onToggle, togglingIds, userId, date])}
              scrollEnabled={false}
              ItemSeparatorComponent={() => (
                <View className="h-px bg-outline-variant" />
              )}
            />
          )}
        </View>
      )}
    </View>
  );
}
