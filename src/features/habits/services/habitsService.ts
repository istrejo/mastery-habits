import { supabase } from "../../../core/api/supabase";
import type { Habit, HabitLog } from "../useHabitsStore";

export async function fetchActiveHabits(userId: string): Promise<Habit[]> {
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (error) return [];
  return (data as Habit[]) ?? [];
}

export async function fetchLogsForDate(
  userId: string,
  date: string,
): Promise<HabitLog[]> {
  const { data, error } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("completed_date", date);

  if (error || !data) return [];
  return data as HabitLog[];
}

export async function insertHabitLog(
  habitId: string,
  userId: string,
  date: string,
): Promise<HabitLog | null> {
  const { data, error } = await supabase
    .from("habit_logs")
    .upsert(
      { habit_id: habitId, user_id: userId, completed_date: date },
      { onConflict: "habit_id,completed_date", ignoreDuplicates: true },
    )
    .select()
    .single();

  if (error) return null;
  return data as HabitLog | null;
}

export async function deleteHabitLog(
  habitId: string,
  date: string,
): Promise<void> {
  const { error } = await supabase
    .from("habit_logs")
    .delete()
    .eq("habit_id", habitId)
    .eq("completed_date", date);

  if (error) throw new Error(error.message);
}

export async function writeStreak(
  habitId: string,
  streak: number,
): Promise<void> {
  const { error } = await supabase
    .from("habits")
    .update({ current_streak: streak })
    .eq("id", habitId);

  if (error) throw new Error(error.message);
}
