import { addDays, format } from 'date-fns';
import { supabase } from '@core/lib/supabase';
import { useSessionStore } from '@core/states/session.store';
import { syncQueueService } from '@core/services/syncQueue.service';
import { isNetworkError } from '@core/utils/isNetworkError';
import { tasksCacheService } from './tasksCache.service';
import type {
  CreateTaskWithSubtasksInput,
  TaskInsert,
  TaskSubtask,
  TaskUpdate,
  TaskWithHabit,
} from '../types';

const TASK_SELECT = '*, habits(id, name), task_subtasks(*)';

const sortTaskSubtasks = (task: TaskWithHabit): TaskWithHabit => ({
  ...task,
  task_subtasks: [...(task.task_subtasks ?? [])].sort(
    (a, b) => a.order_index - b.order_index
  ),
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

const buildOptimisticTask = (
  input: Omit<TaskInsert, 'user_id'>,
  id: string = `temp_${Date.now()}`
): TaskWithHabit => ({
  id,
  user_id: requireUserId(),
  title: input.title,
  description: input.description ?? null,
  due_date: input.due_date ?? null,
  habit_id: input.habit_id ?? null,
  status: input.status ?? 'pending',
  completed_at: input.completed_at ?? null,
  created_at: new Date().toISOString(),
  habits: null,
  task_subtasks: [],
});

const buildOptimisticTaskWithSubtasks = (
  input: CreateTaskWithSubtasksInput,
  tempId: string = `temp_${Date.now()}`
): TaskWithHabit => ({
  ...buildOptimisticTask(
    {
      title: input.title,
      description: input.notes || null,
      due_date: format(new Date(), 'yyyy-MM-dd'),
      habit_id: null,
    },
    tempId
  ),
  task_subtasks: (input.subtasks || []).map((subtask, index) => ({
    id: `temp_sub_${Date.now()}_${index}`,
    task_id: tempId,
    user_id: requireUserId(),
    title: subtask.title,
    status: subtask.completed ? ('completed' as const) : ('pending' as const),
    order_index: index,
    completed_at: subtask.completed ? new Date().toISOString() : null,
    created_at: new Date().toISOString(),
  })),
});

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

  async createWithSync(
    input: Omit<TaskInsert, 'user_id'>
  ): Promise<TaskWithHabit> {
    const optimisticTask = buildOptimisticTask(input);
    try {
      const result = await this.create(input);
      await tasksCacheService.upsert(result);
      return result;
    } catch (error) {
      if (isNetworkError(error)) {
        await syncQueueService.enqueue({
          type: 'task_create',
          payload: { mode: 'plain', optimisticId: optimisticTask.id, input },
        });
        await tasksCacheService.upsert(optimisticTask);
        return optimisticTask;
      }
      throw error;
    }
  },

  async createWithSubtasks(
    input: CreateTaskWithSubtasksInput
  ): Promise<TaskWithHabit> {
    const userId = requireUserId();
    const title = input.title.trim();
    const subtasks = (input.subtasks ?? []).reduce<{ title: string; completed: boolean }[]>(
      (acc, item) => {
        const title = item.title.trim();
        if (title) acc.push({ title, completed: item.completed });
        return acc;
      },
      []
    );
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
      title: subtask.title,
      status: subtask.completed ? ('completed' as const) : ('pending' as const),
      completed_at: subtask.completed ? new Date().toISOString() : null,
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

  async toggleSubtask(
    taskId: string,
    subtaskId: string
  ): Promise<TaskWithHabit> {
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
      .update({
        status: isCompleting ? 'completed' : 'pending',
        completed_at: isCompleting ? new Date().toISOString() : null,
      })
      .eq('id', subtaskId);

    if (updateError) throw new Error(updateError.message);

    const task = await tasksService.getById(taskId);
    const hasSubtasks = task.task_subtasks.length > 0;
    const allCompleted =
      hasSubtasks &&
      task.task_subtasks.every((item) => item.status === 'completed');

    if (allCompleted && task.status !== 'completed') {
      return tasksService.update(taskId, {
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
    }

    if (!allCompleted && task.status === 'completed') {
      return tasksService.update(taskId, {
        status: 'pending',
        completed_at: null,
      });
    }

    return task;
  },

  async updateWithSubtasks(
    id: string,
    input: CreateTaskWithSubtasksInput
  ): Promise<TaskWithHabit> {
    const userId = requireUserId();
    const title = input.title.trim();
    const newSubtasks = (input.subtasks ?? []).reduce<{ title: string; completed: boolean }[]>(
      (acc, item) => {
        const title = item.title.trim();
        if (title) acc.push({ title, completed: item.completed });
        return acc;
      },
      []
    );

    const [task, { error: deleteError }] = await Promise.all([
      tasksService.update(id, {
        title,
        description: input.notes?.trim() || null,
      }),
      supabase
        .from('task_subtasks')
        .delete()
        .eq('task_id', id),
    ]);

    if (deleteError) throw new Error(deleteError.message);

    if (newSubtasks.length === 0) return { ...task, task_subtasks: [] };

    const rows = newSubtasks.map((subtask, index) => ({
      task_id: id,
      user_id: userId,
      title: subtask.title,
      status: subtask.completed ? ('completed' as const) : ('pending' as const),
      completed_at: subtask.completed ? new Date().toISOString() : null,
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

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async completeWithSync(id: string): Promise<TaskWithHabit> {
    try {
      const result = await this.complete(id);
      await tasksCacheService.upsert(result);
      return result;
    } catch (error) {
      if (isNetworkError(error)) {
        await syncQueueService.enqueue({ type: 'task_complete', payload: { id } });
        const cached = await tasksCacheService.load();
        const task = cached.find((t) => t.id === id);
        if (task) {
          const optimistic = {
            ...task,
            status: 'completed' as const,
            completed_at: new Date().toISOString(),
          };
          await tasksCacheService.upsert(optimistic);
          return optimistic;
        }
      }
      throw error;
    }
  },

  async uncompleteWithSync(id: string): Promise<TaskWithHabit> {
    try {
      const result = await this.uncomplete(id);
      await tasksCacheService.upsert(result);
      return result;
    } catch (error) {
      if (isNetworkError(error)) {
        await syncQueueService.enqueue({ type: 'task_uncomplete', payload: { id } });
        const cached = await tasksCacheService.load();
        const task = cached.find((t) => t.id === id);
        if (task) {
          const optimistic = {
            ...task,
            status: 'pending' as const,
            completed_at: null,
          };
          await tasksCacheService.upsert(optimistic);
          return optimistic;
        }
      }
      throw error;
    }
  },

  async toggleSubtaskWithSync(
    taskId: string,
    subtaskId: string
  ): Promise<TaskWithHabit> {
    try {
      const result = await this.toggleSubtask(taskId, subtaskId);
      await tasksCacheService.upsert(result);
      return result;
    } catch (error) {
      if (isNetworkError(error)) {
        await syncQueueService.enqueue({
          type: 'subtask_toggle',
          payload: { taskId, subtaskId },
        });
        const cached = await tasksCacheService.load();
        const task = cached.find((t) => t.id === taskId);
        if (task) {
          return task;
        }
      }
      throw error;
    }
  },

  async createWithSubtasksWithSync(
    input: CreateTaskWithSubtasksInput
  ): Promise<TaskWithHabit> {
    const optimisticTask = buildOptimisticTaskWithSubtasks(input);
    try {
      const result = await this.createWithSubtasks(input);
      await tasksCacheService.upsert(result);
      return result;
    } catch (error) {
      if (isNetworkError(error)) {
        await syncQueueService.enqueue({
          type: 'task_create',
          payload: {
            mode: 'withSubtasks',
            optimisticId: optimisticTask.id,
            optimisticSubtaskIds: optimisticTask.task_subtasks.map((subtask) => subtask.id),
            input,
          },
        });
        await tasksCacheService.upsert(optimisticTask);
        return optimisticTask;
      }
      throw error;
    }
  },

  async updateWithSubtasksWithSync(
    id: string,
    input: CreateTaskWithSubtasksInput
  ): Promise<TaskWithHabit> {
    try {
      const result = await this.updateWithSubtasks(id, input);
      await tasksCacheService.upsert(result);
      return result;
    } catch (error) {
      if (isNetworkError(error)) {
        await syncQueueService.enqueue({
          type: 'task_update',
          payload: { id, ...input },
        });
        const cached = await tasksCacheService.load();
        const task = cached.find((t) => t.id === id);
        if (task) {
          return task;
        }
      }
      throw error;
    }
  },

  async deleteWithSync(id: string): Promise<void> {
    try {
      await this.delete(id);
      await tasksCacheService.remove(id);
    } catch (error) {
      if (isNetworkError(error)) {
        await syncQueueService.enqueue({ type: 'task_delete', payload: { id } });
        await tasksCacheService.remove(id);
        return;
      }
      throw error;
    }
  },
};
