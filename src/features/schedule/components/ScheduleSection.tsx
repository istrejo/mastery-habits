import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ScheduleEvent } from "../mockSchedule";

interface ScheduleSectionProps {
  events: ScheduleEvent[];
}

/**
 * Placeholder: renders mock schedule events with icons, titles, times, and subtitles.
 * TODO: Replace with Google Calendar integration when ready.
 *
 * - Collapsible section header with `event` icon + "Schedule" title + chevron
 * - Each event: icon (videocam or location_on) + title + time + subtitle
 */
export function ScheduleSection({ events }: ScheduleSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const icon = expanded ? "expand-less" : "expand-more";

  return (
    <View className="mb-4">
      {/* Section Header */}
      <Pressable
        className="flex-row items-center justify-between px-4 py-3"
        onPress={() => setExpanded((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Collapse schedule" : "Expand schedule"}
      >
        <View className="flex-row items-center gap-sm">
          <MaterialIcons name="event" size={24} color="currentColor" />
          <Text className="text-on-surface text-title-md font-semibold">
            Schedule
          </Text>
        </View>
        <MaterialIcons name={icon} size={24} color="currentColor" />
      </Pressable>

      {/* Event List */}
      {expanded && events.length > 0 && (
        <View className="px-4 gap-2">
          {events.map((event) => (
            <View
              key={event.id}
              className="flex-row items-start gap-3 p-3 bg-surface-variant rounded-xl"
            >
              <MaterialIcons
                name={event.kind === "video" ? "videocam" : "location-on"}
                size={20}
                className="text-primary mt-0.5"
              />
              <View className="flex-1">
                <Text className="text-on-surface text-body-md font-medium">
                  {event.title}
                </Text>
                <Text className="text-on-surface-variant text-body-sm">
                  {event.time}
                </Text>
                <Text className="text-on-surface-variant text-body-xs">
                  {event.subtitle}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {expanded && events.length === 0 && (
        <View className="px-4 py-2">
          <Text className="text-on-surface-variant text-body-sm">
            No events scheduled.
          </Text>
        </View>
      )}
    </View>
  );
}
