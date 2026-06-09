import { useEffect } from 'react';
import { Linking } from 'react-native';
import { authService } from '../services/authService';
import { supabase } from '../../../core/api/supabase';

/**
 * Listens for OAuth deep-link callbacks on cold-start and exchanges the
 * authorization code for a Supabase session.
 *
 * Guards against double-exchange: signInWithGoogle already handles the PKCE
 * exchange inline when the app is in the foreground. This hook only runs when
 * no session exists yet (i.e. cold-start after a redirect).
 */
export function useOAuthCallback() {
  useEffect(() => {
    const handleUrl = async ({ url }: { url: string }) => {
      const match = url.match(/[?&]code=([^&]+)/);
      const code = match?.[1] ? decodeURIComponent(match[1]) : null;

      if (!code) return;

      // Skip if a session is already active — signInWithGoogle handled it inline
      const { data } = await supabase.auth.getSession();
      if (data.session) return;

      try {
        await authService.exchangeCodeForSession(code);
      } catch (err) {
        console.error('[useOAuthCallback] code exchange failed:', err);
      }
    };

    // Handle cold-start deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    // Handle foreground deep link
    const subscription = Linking.addEventListener('url', handleUrl);
    return () => subscription.remove();
  }, []);
}
