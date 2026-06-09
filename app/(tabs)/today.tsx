import React, { useState, useRef, useCallback } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useHabitsQuery } from "../../src/features/habits/hooks/useHabitsQuery";
import { useToggleHabit } from "../../src/features/habits/hooks/useToggleHabit";
import { HabitsSection } from "../../src/features/habits/components/HabitsSection";
import { useTasksQuery } from "../../src/features/tasks/hooks/useTasksQuery";
import { useCreateTask } from "../../src/features/tasks/hooks/useCreateTask";
import { useToggleTask } from "../../src/features/tasks/hooks/useToggleTask";
import { TasksSection } from "../../src/features/tasks/components/TasksSection";
import {
  CreateTaskSheet,
  type CreateTaskSheetRef,
  type CreateTaskInput,
} from "../../src/features/tasks/components/CreateTaskSheet";
import { ScheduleSection } from "../../src/features/schedule/components/ScheduleSection";
import { getMockSchedule } from "../../src/features/schedule/mockSchedule";
import { PomodoroPill } from "../../src/features/pomodoro/components/PomodoroPill";
import { WeekStrip } from "../../src/shared/ui/WeekStrip";
import { todayString } from "../../src/core/utils/date";

export default function TodayScreen() {
  // State
  const [selectedDate, setSelectedDate] = useState(() => todayString());
  const sheetRef = useRef<CreateTaskSheetRef>(null);

  // Auth
  const { user } = useAuthStore();
  const userId = user?.id ?? "";

  // Data hooks
  const habitsQuery = useHabitsQuery(userId, selectedDate);
  const tasksQuery = useTasksQuery(userId, selectedDate);
  const habits = habitsQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];

  const toggleHabit = useToggleHabit(userId, selectedDate);
  const toggleTask = useToggleTask(userId, selectedDate);
  const createTask = useCreateTask(userId);

  // Mock schedule
  const events = getMockSchedule(selectedDate);

  // Pomodoro navigation
  const router = useRouter();

  // Handlers
  const handleToggleHabit = useCallback(
    (habitId: string) => {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;
      toggleHabit.mutate({
        habitId,
        checked: habit.completed,
        frequency: habit.frequency,
      });
    },
    [habits, toggleHabit.mutate],
  );

  const handleToggleTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      toggleTask.mutate({
        taskId,
        isCompleted: task.is_completed,
      });
    },
    [tasks, toggleTask.mutate],
  );

  const handleCreateTask = useCallback(
    (data: CreateTaskInput) => {
      createTask.mutate(data);
    },
    [createTask],
  );

  const handleOpenSheet = useCallback(() => {
    sheetRef.current?.present();
  }, []);

  const handleCloseSheet = useCallback(() => {
    // Sheet dismisses itself via @gorhom/bottom-sheet
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Week Strip */}
        <WeekStrip
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {/* Schedule Section */}
        <ScheduleSection events={events} />

        {/* Habits Section */}
        <HabitsSection habits={habits} onToggle={handleToggleHabit} />

        {/* Tasks Section */}
        <TasksSection
          tasks={tasks}
          onToggleTask={handleToggleTask}
          onAddTask={handleOpenSheet}
        />
      </ScrollView>

      {/* Create Task Sheet */}
      <CreateTaskSheet
        ref={sheetRef}
        defaultDate={selectedDate}
        onSubmit={handleCreateTask}
        onClose={handleCloseSheet}
      />

      {/* Floating Pomodoro Pill */}
      <PomodoroPill onPress={() => router.push("/(tabs)/pomodoro")} />
    </SafeAreaView>
  );
}
