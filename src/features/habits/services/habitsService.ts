import { supabase } from "../../../core/api/supabase";
import { toDateString } from "../../../core/utils/date";
import { Habit, HabitLog } from "../useHabitsStore";

export async function fetchActiveHabits(userId: string): Promise<Habit[]> {
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true);
  if (error) throw error;
  return data;
}

export async function fetchHabitLogs(
  userId: string,
  date: string
): Promise<HabitLog[]> {
  const { data, error } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("completed_date", date);
  if (error) throw error;
  return data;
}

export async function insertHabitLog(
  habitId: string,
  userId: string,
  date: string
): Promise<void> {
  const { error } = await supabase
    .from("habit_logs")
    .upsert(
      { habit_id: habitId, user_id: userId, completed_date: date },
      { onConflict: "habit_id,completed_date", ignoreDuplicates: true }
    );
  if (error) throw error;
}

export async function deleteHabitLog(
  habitId: string,
  userId: string,
  date: string
): Promise<void> {
  const { error } = await supabase
    .from("habit_logs")
    .delete()
    .eq("habit_id", habitId)
    .eq("user_id", userId)
    .eq("completed_date", date);
  if (error) throw error;
}

export async function writeStreak(
  habitId: string,
  streak: number
): Promise<void> {
  const { error } = await supabase
    .from("habits")
    .update({ current_streak: streak })
    .eq("id", habitId);
  if (error) throw error;
}

export async function fetchHabitLogs_forStreak(
  habitId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from("habit_logs")
    .select("completed_date")
    .eq("habit_id", habitId)
    .order("completed_date", { ascending: false });
  if (error) throw error;
  return data.map((row) => row.completed_date);
}

export function computeStreak(
  completedDates: string[],
  frequency: "daily" | "weekly"
): number {
  if (completedDates.length === 0) return 0;

  const dateSet = new Set(completedDates);
  const today = toDateString(new Date());

  if (frequency === "daily") {
    let streak = 0;
    const cursor = new Date();
    while (true) {
      const key = toDateString(cursor);
      if (!dateSet.has(key)) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  // weekly: count consecutive ISO weeks that have at least one log
  const getISOWeek = (dateStr: string): string => {
    const d = new Date(dateStr + "T12:00:00Z");
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
    return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
  };

  const weeksWithLogs = new Set(completedDates.map(getISOWeek));
  const todayWeek = getISOWeek(today);

  let streak = 0;
  const cursor = new Date();
  let currentWeek = todayWeek;

  while (weeksWithLogs.has(currentWeek)) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 7);
    currentWeek = getISOWeek(toDateString(cursor));
  }

  return streak;
}
