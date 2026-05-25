import { addDays, format } from 'date-fns';
import { supabase } from '@core/lib/supabase';
import { useSessionStore } from '@core/states/session.store';
import type { CreateTaskWithSubtasksInput, TaskInsert, TaskSubtask, TaskUpdate, TaskWithHabit } from '../types';

const TASK_SELECT = '*, habits(id, name), task_subtasks(*)';

const sortTaskSubtasks = (task: TaskWithHabit): TaskWithHabit => ({
  ...task,
  task_subtasks: [...(task.task_subtasks ?? [])].sort((a, b) => a.order_index - b.order_index),
});

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = addDays(start, 1);
  return {
    today: format(start, 'yyyy-MM-dd'),
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
};

const requireUserId = () => {
  const userId = useSessionStore.getState().user?.id;
  if (!userId) throw new Error('unauthenticated');
  return userId;
};

export const tasksService = {
  async list(): Promise<TaskWithHabit[]> {
    const userId = requireUserId();

    const { data, error } = await supabase
      .from('tasks')
      .select(TASK_SELECT)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return ((data ?? []) as TaskWithHabit[]).map(sortTaskSubtasks);
  },

  async listByHabit(habitId: string): Promise<TaskWithHabit[]> {
    const userId = requireUserId();

    const { data, error } = await supabase
      .from('tasks')
      .select(TASK_SELECT)
      .eq('user_id', userId)
      .eq('habit_id', habitId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return ((data ?? []) as TaskWithHabit[]).map(sortTaskSubtasks);
  },

  async listToday(): Promise<TaskWithHabit[]> {
    const userId = requireUserId();

    const { today, startIso, endIso } = getTodayRange();
    const filter = [
      `and(status.eq.pending,due_date.lte.${today})`,
      `and(status.eq.completed,due_date.lte.${today},completed_at.gte.${startIso},completed_at.lt.${endIso})`,
    ].join(',');

    const { data, error } = await supabase
      .from('tasks')
      .select(TASK_SELECT)
      .eq('user_id', userId)
      .or(filter)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return ((data ?? []) as TaskWithHabit[]).map(sortTaskSubtasks);
  },

  async create(input: Omit<TaskInsert, 'user_id'>): Promise<TaskWithHabit> {
    const userId = requireUserId();

    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...input, user_id: userId })
      .select(TASK_SELECT)
      .single();

    if (error) throw new Error(error.message);
    return sortTaskSubtasks(data as TaskWithHabit);
  },

  async createWithSubtasks(input: CreateTaskWithSubtasksInput): Promise<TaskWithHabit> {
    const userId = requireUserId();
    const title = input.title.trim();
    const subtasks = (input.subtasks ?? []).map((item) => item.trim()).filter(Boolean);
    const today = format(new Date(), 'yyyy-MM-dd');

    const task = await tasksService.create({
      title,
      description: input.notes?.trim() || null,
      due_date: today,
      habit_id: null,
    });

    if (subtasks.length === 0) return { ...task, task_subtasks: [] };

    const rows = subtasks.map((subtask, index) => ({
      task_id: task.id,
      user_id: userId,
      title: subtask,
      order_index: index,
    }));

    const { data, error } = await supabase
      .from('task_subtasks')
      .insert(rows)
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw new Error(error.message);
    return { ...task, task_subtasks: (data ?? []) as TaskSubtask[] };
  },

  async update(id: string, patch: TaskUpdate): Promise<TaskWithHabit> {
    const { data, error } = await supabase
      .from('tasks')
      .update(patch)
      .eq('id', id)
      .select(TASK_SELECT)
      .single();

    if (error) throw new Error(error.message);
    return sortTaskSubtasks(data as TaskWithHabit);
  },

  async getById(id: string): Promise<TaskWithHabit> {
    const userId = requireUserId();
    const { data, error } = await supabase
      .from('tasks')
      .select(TASK_SELECT)
      .eq('user_id', userId)
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return sortTaskSubtasks(data as TaskWithHabit);
  },

  async complete(id: string): Promise<TaskWithHabit> {
    const completedAt = new Date().toISOString();
    const { error: subtaskError } = await supabase
      .from('task_subtasks')
      .update({ status: 'completed', completed_at: completedAt })
      .eq('task_id', id);

    if (subtaskError) throw new Error(subtaskError.message);

    return tasksService.update(id, {
      status: 'completed',
      completed_at: completedAt,
    });
  },

  async uncomplete(id: string): Promise<TaskWithHabit> {
    const { error: subtaskError } = await supabase
      .from('task_subtasks')
      .update({ status: 'pending', completed_at: null })
      .eq('task_id', id);

    if (subtaskError) throw new Error(subtaskError.message);

    return tasksService.update(id, {
      status: 'pending',
      completed_at: null,
    });
  },

  async toggleSubtask(taskId: string, subtaskId: string): Promise<TaskWithHabit> {
    const userId = requireUserId();
    const { data: subtask, error: readError } = await supabase
      .from('task_subtasks')
      .select('*')
      .eq('user_id', userId)
      .eq('id', subtaskId)
      .single();

    if (readError) throw new Error(readError.message);

    const isCompleting = subtask.status !== 'completed';
    const { error: updateError } = await supabase
      .from('task_subtasks')
      .update({ status: isCompleting ? 'completed' : 'pending', completed_at: isCompleting ? new Date().toISOString() : null })
      .eq('id', subtaskId);

    if (updateError) throw new Error(updateError.message);

    const task = await tasksService.getById(taskId);
    const hasSubtasks = task.task_subtasks.length > 0;
    const allCompleted = hasSubtasks && task.task_subtasks.every((item) => item.status === 'completed');

    if (allCompleted && task.status !== 'completed') {
      return tasksService.update(taskId, { status: 'completed', completed_at: new Date().toISOString() });
    }

    if (!allCompleted && task.status === 'completed') {
      return tasksService.update(taskId, { status: 'pending', completed_at: null });
    }

    return task;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
