import { useCallback, useState } from 'react';
import { tasksService } from '../services/tasks.service';
import { useTasksStore } from '../states/tasks.store';
import type { CreateTaskWithSubtasksInput, TaskInsert } from '../types';

export const useTaskActions = () => {
  const { upsertTask, removeTask } = useTasksStore();
  const [error, setError] = useState<string | null>(null);

  const createTask = useCallback(
    async (input: Omit<TaskInsert, 'user_id'>) => {
      setError(null);
      try {
        const task = await tasksService.create(input);
        upsertTask(task);
        return task;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown_error';
        setError(msg);
        return null;
      }
    },
    [upsertTask]
  );

  const createTaskWithSubtasks = useCallback(
    async (input: CreateTaskWithSubtasksInput) => {
      setError(null);
      try {
        const task = await tasksService.createWithSubtasks(input);
        upsertTask(task);
        return task;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown_error';
        setError(msg);
        return null;
      }
    },
    [upsertTask]
  );

  const completeTask = useCallback(
    async (id: string) => {
      setError(null);
      try {
        const task = await tasksService.complete(id);
        upsertTask(task);
        return task;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown_error';
        setError(msg);
        return null;
      }
    },
    [upsertTask]
  );

  const uncompleteTask = useCallback(
    async (id: string) => {
      setError(null);
      try {
        const task = await tasksService.uncomplete(id);
        upsertTask(task);
        return task;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown_error';
        setError(msg);
        return null;
      }
    },
    [upsertTask]
  );

  const toggleSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      setError(null);
      try {
        const task = await tasksService.toggleSubtask(taskId, subtaskId);
        upsertTask(task);
        return task;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown_error';
        setError(msg);
        return null;
      }
    },
    [upsertTask]
  );

  const updateTaskWithSubtasks = useCallback(
    async (id: string, input: CreateTaskWithSubtasksInput) => {
      setError(null);
      try {
        const task = await tasksService.updateWithSubtasks(id, input);
        upsertTask(task);
        return task;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown_error';
        setError(msg);
        return null;
      }
    },
    [upsertTask]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      setError(null);
      try {
        await tasksService.delete(id);
        removeTask(id);
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown_error';
        setError(msg);
        return false;
      }
    },
    [removeTask]
  );

  return {
    createTask,
    createTaskWithSubtasks,
    updateTaskWithSubtasks,
    completeTask,
    uncompleteTask,
    toggleSubtask,
    deleteTask,
    error,
  };
};
