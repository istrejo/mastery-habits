import { supabase } from "../../../core/api/supabase";
import type { Database } from "../../../shared/types/database.types";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskFrequency = Database["public"]["Enums"]["task_frequency"];

export interface InsertTaskInput {
  title: string;
  due_date: string;
  frequency: TaskFrequency;
  custom_days?: number[];
  description?: string;
}

export async function fetchTasksByDate(
  userId: string,
  date: string,
): Promise<TaskRow[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("due_date", date)
    .is("parent_id", null)
    .order("created_at");

  if (error || !data) return [];
  return data as TaskRow[];
}

export async function fetchSubTasks(parentId: string): Promise<TaskRow[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("parent_id", parentId)
    .order("created_at");

  if (error || !data) return [];
  return data as TaskRow[];
}

export async function insertTask(
  userId: string,
  data: InsertTaskInput,
): Promise<TaskRow> {
  const insertPayload: Record<string, unknown> = {
    title: data.title,
    due_date: data.due_date,
    frequency: data.frequency,
    user_id: userId,
  };

  if (data.description) insertPayload.description = data.description;
  if (data.custom_days) insertPayload.custom_days = data.custom_days;

  const { data: inserted, error } = await supabase
    .from("tasks")
    .insert(insertPayload as TaskInsert)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return inserted as TaskRow;
}

export async function insertSubTask(
  parentId: string,
  userId: string,
  title: string,
): Promise<TaskRow> {
  // Fetch parent to inherit due_date
  const { data: parent, error: parentError } = await supabase
    .from("tasks")
    .select("due_date")
    .eq("id", parentId)
    .single();

  if (parentError) throw new Error(parentError.message);

  const { data: inserted, error } = await supabase
    .from("tasks")
    .insert({
      title,
      parent_id: parentId,
      user_id: userId,
      due_date: (parent as { due_date: string | null }).due_date,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return inserted as TaskRow;
}

export async function toggleTask(
  taskId: string,
  isCompleted: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("tasks")
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq("id", taskId);

  if (error) throw new Error(error.message);
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) throw new Error(error.message);
}
