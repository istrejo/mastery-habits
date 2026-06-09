import { useState } from "react";
import { LayoutAnimation, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getMockSchedule, ScheduleEvent } from "../mockSchedule";

interface Props {
  date: string;
}

export function ScheduleSection({ date }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const events = getMockSchedule(date);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsed((v) => !v);
  };

  return (
    <View className="mx-4 mb-3">
      <Pressable
        onPress={toggle}
        className="flex-row items-center justify-between py-3"
        accessibilityRole="button"
        accessibilityLabel="Toggle schedule section"
      >
        <Text className="text-base font-semibold text-on-surface">Schedule</Text>
        <Ionicons
          name={collapsed ? "chevron-down" : "chevron-up"}
          size={20}
          color="#434655"
        />
      </Pressable>

      {!collapsed && (
        <View className="gap-2">
          {events.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </View>
      )}
    </View>
  );
}

function EventRow({ event }: { event: ScheduleEvent }) {
  return (
    <View className="flex-row items-center gap-3 py-2 px-3 bg-surface-container-low rounded-xl">
      <Ionicons
        name={event.kind === "video" ? "videocam-outline" : "location-outline"}
        size={20}
        color="#006c49"
      />
      <View className="flex-1">
        <Text className="text-sm font-medium text-on-surface">{event.title}</Text>
        <Text className="text-xs text-on-surface-variant">
          {event.time} · {event.subtitle}
        </Text>
      </View>
    </View>
  );
}
