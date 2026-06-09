import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { HabitChip } from "./HabitChip";
import type { HabitWithCompletion } from "../hooks/useHabitsQuery";

interface HabitsSectionProps {
  habits: HabitWithCompletion[];
  onToggle: (habitId: string) => void;
}

/**
 * Collapsible section with "Habits" header and scrollable row of chips.
 *
 * - Section header with eco icon + "Habits" title + chevron
 * - Horizontal scroll of HabitChip components
 * - Toggle expands/collapses the chip row
 */
export function HabitsSection({ habits, onToggle }: HabitsSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const chevron = expanded ? "expand-less" : "expand-more";

  return (
    <View className="mb-4">
      {/* Section Header */}
      <Pressable
        className="flex-row items-center justify-between px-4 py-3"
        onPress={() => setExpanded((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Collapse habits" : "Expand habits"}
      >
        <View className="flex-row items-center gap-sm">
          <MaterialIcons name="eco" size={24} color="currentColor" />
          <Text className="text-on-surface text-title-md font-semibold">
            Habits
          </Text>
        </View>
        <MaterialIcons name={chevron} size={24} color="currentColor" />
      </Pressable>

      {/* Chip Row */}
      {expanded && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4"
          contentContainerStyle={{ flexDirection: "row", alignItems: "center" }}
        >
          {habits.map((habit) => (
            <HabitChip
              key={habit.id}
              habit={habit}
              onToggle={() => onToggle(habit.id)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
