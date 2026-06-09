import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useHabitsQuery } from "../../src/features/habits/hooks/useHabitsQuery";
import { useToggleHabit } from "../../src/features/habits/hooks/useToggleHabit";
import { HabitsSection } from "../../src/features/habits/components/HabitsSection";
import { useTasksQuery } from "../../src/features/tasks/hooks/useTasksQuery";
import { useToggleTask } from "../../src/features/tasks/hooks/useToggleTask";
import { useTasksStore } from "../../src/features/tasks/useTasksStore";
import { TasksSection } from "../../src/features/tasks/components/TasksSection";
import { CreateTaskSheet } from "../../src/features/tasks/components/CreateTaskSheet";
import { ScheduleSection } from "../../src/features/schedule/components/ScheduleSection";
import { Header } from "../../src/features/today/components/Header";
import { PomodoroPill } from "../../src/features/today/components/PomodoroPill";
import { WeekStrip } from "../../src/shared/ui/WeekStrip";
import { todayString } from "../../src/core/utils/date";
import type { HabitWithCompletion } from "../../src/features/habits/hooks/useHabitsQuery";

export default function TodayScreen() {
  const { session } = useAuthStore();
  const userId = session?.user?.id ?? "";
  const insets = useSafeAreaInsets();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayString);

  const { habitsWithCompletion, isLoading: habitsLoading } = useHabitsQuery(
    userId,
    selectedDate
  );
  const toggleHabitMutation = useToggleHabit();

  const { tasks, isLoading: tasksLoading } = useTasksQuery(userId, selectedDate);
  const toggleTaskMutation = useToggleTask();
  const { togglingIds } = useTasksStore();

  const handleToggleHabit = (habit: HabitWithCompletion) => {
    if (!userId) return;
    toggleHabitMutation.mutate({
      habitId: habit.id,
      userId,
      date: selectedDate,
      frequency: habit.frequency,
      currentlyCompleted: habit.completed,
    });
  };

  const handleToggleTask = (id: string, isCompleted: boolean) => {
    if (!userId) return;
    toggleTaskMutation.mutate({ id, userId, date: selectedDate, isCompleted });
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <Header />
      <WeekStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        <ScheduleSection date={selectedDate} />

        <View className="mx-4 mb-3">
          <HabitsSection
            habits={habitsWithCompletion}
            onToggle={handleToggleHabit}
            isLoading={habitsLoading}
          />
        </View>

        <View className="mx-4 mb-6">
          <TasksSection
            tasks={tasks}
            togglingIds={togglingIds}
            onToggle={handleToggleTask}
            onAddTask={() => setShowCreateTask(true)}
            isLoading={tasksLoading}
            userId={userId}
            date={selectedDate}
          />
        </View>
      </ScrollView>

      <View className="absolute right-4" style={{ bottom: insets.bottom + 72 }}>
        <PomodoroPill />
      </View>

      <CreateTaskSheet
        visible={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        defaultDate={selectedDate}
        userId={userId}
        onSuccess={() => {}}
      />
    </View>
  );
}
