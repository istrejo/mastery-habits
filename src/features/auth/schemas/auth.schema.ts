import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email({ error: 'Enter a valid email' }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.email({ error: 'Enter a valid email' }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const forgotPasswordSchema = z.object({
  email: z.email({ error: 'Enter a valid email' }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
