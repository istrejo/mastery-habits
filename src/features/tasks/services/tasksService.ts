import { supabase } from "../../../core/api/supabase";
import { Task } from "../useTasksStore";
import { toDueDateISO } from "../../../core/utils/date";

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

function sortByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 2;
    const pb = PRIORITY_ORDER[b.priority] ?? 2;
    if (pa !== pb) return pa - pb;
    return a.created_at < b.created_at ? -1 : 1;
  });
}

export async function fetchTopLevelTasks(
  userId: string,
  date: string
): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .is("parent_id", null)
    .eq("user_id", userId)
    .filter("due_date::date", "eq", date)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return sortByPriority(data ?? []);
}

export async function fetchSubTasks(parentId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("parent_id", parentId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export interface InsertTaskPayload {
  userId: string;
  title: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  description?: string;
  subtaskTitles?: string[];
}

export async function insertTask(payload: InsertTaskPayload): Promise<Task> {
  const dueDateISO = toDueDateISO(payload.dueDate);

  const { data: mainTask, error: mainError } = await supabase
    .from("tasks")
    .insert({
      user_id: payload.userId,
      title: payload.title,
      due_date: dueDateISO,
      priority: payload.priority,
      description: payload.description ?? null,
      parent_id: null,
    })
    .select()
    .single()
    .throwOnError();

  if (mainError || !mainTask) throw mainError ?? new Error("Insert failed");

  if (payload.subtaskTitles && payload.subtaskTitles.length > 0) {
    const subtaskRows = payload.subtaskTitles.map((title) => ({
      user_id: payload.userId,
      title,
      due_date: dueDateISO,
      priority: payload.priority,
      parent_id: mainTask.id,
    }));

    await supabase.from("tasks").insert(subtaskRows).throwOnError();
  }

  return mainTask;
}

export async function insertSubTask(
  parentId: string,
  title: string,
  userId: string,
  dueDate: string
): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      title,
      due_date: toDueDateISO(dueDate),
      priority: "medium",
      parent_id: parentId,
    })
    .select()
    .single()
    .throwOnError();

  if (error || !data) throw error ?? new Error("Insert subtask failed");
  return data;
}

export async function toggleTask(
  id: string,
  isCompleted: boolean
): Promise<void> {
  await supabase
    .from("tasks")
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .throwOnError();
}

export async function deleteTask(id: string): Promise<void> {
  await supabase.from("tasks").delete().eq("id", id).throwOnError();
}
