import { useState } from 'react';
import { authService } from '../services/auth.service';
import { useSessionStore } from '@core/states/session.store';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session, user, clear } = useSessionStore();

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await authService.signIn(email, password);
      if (err) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await authService.signUp(email, password, displayName);
      if (err) setError(err.message);
    } finally {
      setLoading(false);
    }
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

  return { session, user, loading, error, signIn, signUp, signOut, signInWithMagicLink };
};
