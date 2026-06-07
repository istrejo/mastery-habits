import { z } from 'zod';

const strongPassword = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const loginSchema = z.object({
  email: z.email({ error: 'Enter a valid email' }),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.email({ error: 'Enter a valid email' }),
  password: strongPassword,
});

export const forgotPasswordSchema = z.object({
  email: z.email({ error: 'Enter a valid email' }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
