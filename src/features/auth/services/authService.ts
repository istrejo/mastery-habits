import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from '../../../core/api/supabase';

const OAUTH_REDIRECT_URL = 'pendie://google-auth';

export const authService = {
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signUp: (email: string, password: string) =>
    supabase.auth.signUp({ email, password }),

  resendVerification: (email: string) =>
    supabase.auth.resend({ type: 'signup', email }),

  sendPasswordReset: (email: string) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'pendie://(auth)/reset-password',
    }),

  verifyOtp: (email: string, token: string) =>
    supabase.auth.verifyOtp({ email, token, type: 'signup' }),

  signOut: () => supabase.auth.signOut(),

  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: OAUTH_REDIRECT_URL,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error('No OAuth URL returned');

    const result = await WebBrowser.openAuthSessionAsync(data.url, OAUTH_REDIRECT_URL);

    if (result.type !== 'success') return;

    // PKCE flow: ?code=...
    const codeMatch = result.url.match(/[?&]code=([^&#]+)/);
    if (codeMatch?.[1]) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
        decodeURIComponent(codeMatch[1]),
      );
      if (exchangeError) throw exchangeError;
      return;
    }

    // Implicit flow: #access_token=...&refresh_token=...
    const hashMatch = result.url.match(/#(.+)/);
    if (hashMatch?.[1]) {
      const params = new URLSearchParams(hashMatch[1]);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) throw sessionError;
        return;
      }
    }

    throw new Error('No authorization code in redirect URL');
  },

  signInWithApple: async () => {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error('Apple Sign-In failed: no identity token');
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });

    if (error) throw error;
  },

  exchangeCodeForSession: async (code: string) => {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
  },
};
