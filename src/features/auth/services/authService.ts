import { supabase } from '../../../core/api/supabase';

export const authService = {
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signUp: (email: string, password: string) =>
    supabase.auth.signUp({ email, password }),

  resendVerification: (email: string) =>
    supabase.auth.resend({ type: 'signup', email }),

  sendPasswordReset: (email: string) =>
    supabase.auth.resetPasswordForEmail(email),

  verifyOtp: (email: string, token: string) =>
    supabase.auth.verifyOtp({ email, token, type: 'signup' }),

  signOut: () => supabase.auth.signOut(),
};
