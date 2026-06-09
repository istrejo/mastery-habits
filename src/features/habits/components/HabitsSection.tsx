import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { LayoutAnimation, Pressable, ScrollView, Text, View } from "react-native";
import { HabitWithCompletion } from "../hooks/useHabitsQuery";
import { HabitChip } from "./HabitChip";

interface Props {
  habits: HabitWithCompletion[];
  onToggle: (habit: HabitWithCompletion) => void;
  isLoading: boolean;
}

export function HabitsSection({ habits, onToggle, isLoading }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  function toggleCollapsed() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsed((prev) => !prev);
  }

  return (
    <View>
      <Pressable
        onPress={toggleCollapsed}
        className="flex-row items-center justify-between py-2"
      >
        <Text className="text-on-surface font-semibold text-base">Habits</Text>
        <Ionicons
          name={collapsed ? "chevron-down" : "chevron-up"}
          size={18}
          color="#434655"
        />
      </Pressable>

      {!collapsed && (
        <ScrollView
          horizontal={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
        >
          {isLoading ? (
            <>
              <View className="h-9 w-28 bg-surface-container-high rounded-full" />
              <View className="h-9 w-24 bg-surface-container-high rounded-full" />
              <View className="h-9 w-32 bg-surface-container-high rounded-full" />
            </>
          ) : habits.length === 0 ? (
            <Text className="text-on-surface-variant text-sm">No habits for today</Text>
          ) : (
            habits.map((habit) => (
              <HabitChip
                key={habit.id}
                habit={habit}
                onToggle={() => onToggle(habit)}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
