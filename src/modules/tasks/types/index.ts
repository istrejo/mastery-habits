import type { Database } from '@shared/types/database.types';

export type Task = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];
export type TaskStatus = Database['public']['Enums']['task_status'];

export type TaskWithHabit = Task & {
  habits: { id: string; name: string } | null;
};
