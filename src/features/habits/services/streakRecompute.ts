import { supabase } from "../../../core/api/supabase";
import { writeStreak } from "./habitsService";

/**
 * Given a date string in YYYY-MM-DD format, return the previous day.
 */
function yesterday(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Check whether a date string falls within the current ISO week (Mon–Sun).
 */
function isWithinCurrentWeek(dateStr: string): boolean {
  const now = new Date();
  const target = new Date(dateStr + "T12:00:00Z");

  const dayOfWeek = now.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return target >= weekStart && target <= weekEnd;
}

/**
 * Recompute the current streak for a habit based on its frequency.
 *
 * Fetches logs ordered DESC, walks back from today stopping at the first gap.
 * Writes the computed streak back to the database.
 *
 * @returns The new streak value.
 */
export async function recomputeStreak(
  habitId: string,
  frequency: "daily" | "weekly",
): Promise<number> {
  const { data: logs, error } = await supabase
    .from("habit_logs")
    .select("completed_date")
    .eq("habit_id", habitId)
    .order("completed_date", { ascending: false });

  if (error || !logs || logs.length === 0) {
    await writeStreak(habitId, 0);
    return 0;
  }

  if (frequency === "weekly") {
    // Simplified: if any log is in the current week, streak = 1
    const logInCurrentWeek = logs.some((log) =>
      isWithinCurrentWeek(log.completed_date),
    );
    const streak = logInCurrentWeek ? 1 : 0;
    await writeStreak(habitId, streak);
    return streak;
  }

  // Daily: walk back from today, counting consecutive days
  let streak = 0;
  const today = new Date().toISOString().slice(0, 10);
  let cursor = today;

  for (const log of logs) {
    if (log.completed_date === cursor) {
      streak += 1;
      cursor = yesterday(cursor);
    } else {
      break;
    }
  }

  await writeStreak(habitId, streak);
  return streak;
}
