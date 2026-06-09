import { Pressable, ScrollView, Text, View } from "react-native";
import { getWeekDays, isSameDay, toDateString, todayString } from "../../core/utils/date";

interface Props {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export function WeekStrip({ selectedDate, onSelectDate }: Props) {
  const today = todayString();
  const days = getWeekDays(new Date());

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      className="py-2"
    >
      {days.map((day, idx) => {
        const dateStr = toDateString(day);
        const isSelected = isSameDay(dateStr, selectedDate);
        const isToday = isSameDay(dateStr, today);

        return (
          <Pressable
            key={dateStr}
            onPress={() => onSelectDate(dateStr)}
            accessibilityRole="button"
            accessibilityLabel={`${DAY_LABELS[idx]} ${day.getDate()}${isSelected ? ", selected" : ""}`}
            accessibilityState={{ selected: isSelected }}
            className={`items-center justify-center w-12 py-2 rounded-full ${
              isSelected ? "bg-secondary" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                isSelected ? "text-on-secondary" : "text-on-surface-variant"
              }`}
            >
              {DAY_LABELS[idx]}
            </Text>
            <Text
              className={`text-base font-semibold mt-0.5 ${
                isSelected ? "text-on-secondary" : "text-on-surface"
              }`}
            >
              {day.getDate()}
            </Text>
            {isToday && !isSelected && (
              <View className="w-1 h-1 rounded-full bg-secondary mt-0.5" />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
