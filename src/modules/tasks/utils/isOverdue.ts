import { isBefore, parseISO, startOfDay } from 'date-fns';
import type { Task } from '../types';

export const isOverdue = (task: Task, today: Date = new Date()): boolean => {
  if (!task.due_date || task.status === 'completed') return false;
  return isBefore(parseISO(task.due_date), startOfDay(today));
};
