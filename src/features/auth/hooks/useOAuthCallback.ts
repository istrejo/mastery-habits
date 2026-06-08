import { useEffect } from 'react';
import { Linking } from 'react-native';
import { authService } from '../services/authService';

/**
 * Listens for OAuth deep-link callbacks and exchanges the authorization
 * code for a Supabase session.
 *
 * Place this hook in any auth screen that may receive an OAuth redirect
 * (e.g. login, signup).
 */
export function useOAuthCallback() {
  useEffect(() => {
    const handleUrl = async ({ url }: { url: string }) => {
      // Extract ?code=... from the deep link URL
      const match = url.match(/[?&]code=([^&]+)/);
      const code = match?.[1] ? decodeURIComponent(match[1]) : null;

      if (code) {
        try {
          await authService.exchangeCodeForSession(code);
        } catch {
          // The caller should observe onAuthStateChange for session updates.
          // Errors here are typically handled by the auth guard or UI state.
        }
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
