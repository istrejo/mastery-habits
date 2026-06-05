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

  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'masteryhabits://google-auth',
        skipBrowserRedirect: true,
      },
    });
    return { url: data?.url ?? null, error };
  },

  signInWithApple: (identityToken: string, nonce: string) =>
    supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: identityToken,
      nonce,
    }),

  signOut: () => supabase.auth.signOut(),

  getSession: () => supabase.auth.getSession(),
};
