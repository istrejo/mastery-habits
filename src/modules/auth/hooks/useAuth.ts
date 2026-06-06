import { useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { supabase } from '@core/lib/supabase';
import { withTimeout } from '@core/utils/withTimeout';
import { authService } from '../services/auth.service';
import { useSessionStore } from '@core/states/session.store';

WebBrowser.maybeCompleteAuthSession();

const OAUTH_TIMEOUT_MS = 60_000;

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupEmail, setSignupEmail] = useState<string | null>(null);
  const [resendSent, setResendSent] = useState(false);
  const { session, user, clear } = useSessionStore();

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await authService.signIn(email, password);
      if (err) {
        setError(err.message.toLowerCase().includes('email not confirmed') ? 'email_not_confirmed' : err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    setError(null);
    setSignupEmail(null);
    setResendSent(false);
    try {
      const { error: err } = await authService.signUp(email, password, displayName);
      if (err) {
        setError(err.message);
      } else {
        setSignupEmail(email);
      }
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async (email: string) => {
    setLoading(true);
    setError(null);
    setResendSent(false);
    try {
      const { error: err } = await authService.resendVerificationEmail(email);
      if (err) {
        setError(err.message);
      } else {
        setResendSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearSignupSuccess = () => {
    setSignupEmail(null);
    setResendSent(false);
    setError(null);
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      clear();
    } finally {
      setLoading(false);
    }
  };

  const signInWithMagicLink = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await authService.signInWithMagicLink(email);
      if (err) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const { url, error: err } = await withTimeout(
        authService.signInWithGoogle(),
        OAUTH_TIMEOUT_MS,
        'google_oauth',
      );
      if (err) { setError(err.message); return; }
      if (!url) { setError('No OAuth URL received'); return; }

      const result = await withTimeout(
        WebBrowser.openAuthSessionAsync(url, 'masteryhabits://google-auth'),
        OAUTH_TIMEOUT_MS,
        'google_oauth_browser',
      );
      if (result.type !== 'success') return;

      const hash = new URL(result.url).hash.substring(1);
      const params = new URLSearchParams(hash);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (!access_token || !refresh_token) { setError('OAuth tokens missing'); return; }
      const { error: sessionErr } = await withTimeout(
        supabase.auth.setSession({ access_token, refresh_token }),
        OAUTH_TIMEOUT_MS,
        'google_oauth_session',
      );
      if (sessionErr) setError(sessionErr.message);
    } catch (e: unknown) {
      const code = (e as { code?: string } | null)?.code;
      if (code?.endsWith('_timeout')) {
        setError(code);
        return;
      }
      setError(e instanceof Error ? e.message : 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const signInWithApple = async () => {
    if (Platform.OS !== 'ios') return;
    setLoading(true);
    setError(null);
    try {
      const rawNonce = Crypto.randomUUID();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce,
      );

      const credential = await withTimeout(
        AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
          nonce: hashedNonce,
        }),
        OAUTH_TIMEOUT_MS,
        'apple_oauth',
      );

      if (!credential.identityToken) { setError('Apple identity token missing'); return; }
      const { error: err } = await withTimeout(
        authService.signInWithApple(credential.identityToken, rawNonce),
        OAUTH_TIMEOUT_MS,
        'apple_oauth_session',
      );
      if (err) setError(err.message);
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('ERR_CANCELED')) return;
      const code = (e as { code?: string } | null)?.code;
      if (code?.endsWith('_timeout')) {
        setError(code);
        return;
      }
      setError(e instanceof Error ? e.message : 'Apple sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return { session, user, loading, error, signIn, signUp, signOut, signInWithMagicLink, signInWithGoogle, signInWithApple, resendVerification, signupEmail, resendSent, clearSignupSuccess };
};
