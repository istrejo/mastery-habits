import { z } from 'zod';

export const taskValidationSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  due_date: z.string().optional(),
  habit_id: z.string().uuid().optional().nullable(),
});

export type TaskFormValues = z.infer<typeof taskValidationSchema>;
