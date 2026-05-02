import { supabase } from '@core/lib/supabase';

export const authService = {
  signUp: (email: string, password: string, displayName?: string) =>
    supabase.auth.signUp({
      email,
      password,
      options: displayName ? { data: { display_name: displayName } } : undefined,
    }),

  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signInWithMagicLink: (email: string) =>
    supabase.auth.signInWithOtp({ email }),

  signOut: () => supabase.auth.signOut(),

  getSession: () => supabase.auth.getSession(),
};
