import { Pressable, Text, View } from "react-native";
import { getWeekDays, toDateString, isSameDay } from "../../core/utils/date";

interface WeekStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri"];

/**
 * Mon–Fri strip around today. Shows abbreviated day name + date number.
 *
 * - Selected day: filled primary pill (rounded-full bg-primary text-on-primary)
 * - Unselected days: muted (text-on-surface-variant)
 * - Tapping a day calls `onSelectDate(dateString)`
 * - accessibilityLabel on each day: "{dayName} {dateNumber}"
 */
export function WeekStrip({ selectedDate, onSelectDate }: WeekStripProps) {
  const today = new Date();
  const days = getWeekDays(today);

  return (
    <View className="flex-row justify-around px-2 py-3 mb-2">
      {days.map((day, i) => {
        const dateStr = toDateString(day);
        const isSelected = isSameDay(dateStr, selectedDate);
        const dayNum = day.getDate();

        return (
          <Pressable
            key={dateStr}
            onPress={() => onSelectDate(dateStr)}
            className={`flex-1 items-center py-2 mx-0.5 rounded-full ${
              isSelected ? "bg-primary" : "bg-transparent"
            }`}
            accessibilityRole="button"
            accessibilityLabel={`${DAY_NAMES[i]} ${dayNum}`}
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              className={`text-xs font-medium ${
                isSelected ? "text-on-primary" : "text-on-surface-variant"
              }`}
            >
              {DAY_NAMES[i]}
            </Text>
            <Text
              className={`text-lg font-bold ${
                isSelected ? "text-on-primary" : "text-on-surface"
              }`}
            >
              {dayNum}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
