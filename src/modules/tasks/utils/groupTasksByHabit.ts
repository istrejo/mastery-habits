import type { Task } from '../types';

export const groupTasksByHabit = (tasks: Task[]): Record<string, Task[]> => {
  return tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const key = task.habit_id ?? 'none';
    const group = acc[key] ?? [];
    return { ...acc, [key]: [...group, task] };
  }, {});
};
