import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { Database } from "../../../shared/types/database.types";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

interface SubTaskRowProps {
  subtask: TaskRow;
  onToggle: () => void;
}

export function SubTaskRow({ subtask, onToggle }: SubTaskRowProps) {
  return (
    <View className="flex-row items-start gap-3 py-1.5 ml-8">
      {/* Smaller checkbox */}
      <TouchableOpacity
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityLabel={`Toggle subtask ${subtask.title}`}
        accessibilityState={{ checked: subtask.is_completed }}
      >
        <MaterialIcons
          name={subtask.is_completed ? "check-circle" : "radio-button-unchecked"}
          size={20}
          className={subtask.is_completed ? "text-primary" : "text-muted-foreground"}
        />
      </TouchableOpacity>

      {/* Title */}
      <Text
        className={`text-sm flex-1 ${
          subtask.is_completed ? "text-muted-foreground line-through" : "text-foreground"
        }`}
      >
        {subtask.title}
      </Text>
    </View>
  );
}
