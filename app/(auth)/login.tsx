import * as WebBrowser from 'expo-web-browser';
import { useState, useEffect, useReducer } from 'react';

WebBrowser.maybeCompleteAuthSession();
import { View, Text, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../../src/features/auth/schemas/auth.schema';
import { AuthLayout } from '../../src/features/auth/components/AuthLayout';
import { AuthCard } from '../../src/features/auth/components/AuthCard';
import { FloatingLabelField } from '../../src/shared/ui/FloatingLabelField';
import { FormDivider } from '../../src/shared/ui/FormDivider';
import { EyeToggle } from '../../src/features/auth/components/EyeToggle';
import { Button } from '../../src/shared/ui/Button';
import { authService } from '../../src/features/auth/services/authService';
import { getAuthErrorMessage, isEmailNotConfirmed } from '../../src/features/auth/services/authErrors';
import { useAuthStore } from '../../src/features/auth/useAuthStore';
import { useOAuthCallback } from '../../src/features/auth/hooks/useOAuthCallback';

type SubmitState = {
  loading: boolean;
  socialLoading: string | null;
  serverError: string;
};

type SubmitAction =
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_END' }
  | { type: 'SOCIAL_START'; provider: string }
  | { type: 'SOCIAL_END' }
  | { type: 'SET_ERROR'; message: string };

function submitReducer(state: SubmitState, action: SubmitAction): SubmitState {
  switch (action.type) {
    case 'SUBMIT_START': return { ...state, loading: true, serverError: '' };
    case 'SUBMIT_END': return { ...state, loading: false };
    case 'SOCIAL_START': return { ...state, socialLoading: action.provider, serverError: '' };
    case 'SOCIAL_END': return { ...state, socialLoading: null };
    case 'SET_ERROR': return { ...state, serverError: action.message };
  }
}

export default function LoginScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const [{ loading, socialLoading, serverError }, dispatch] = useReducer(submitReducer, {
    loading: false,
    socialLoading: null,
    serverError: '',
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const setSession = useAuthStore((s) => s.setSession);
  const loginAttempts = useAuthStore((s) => s.loginAttempts);
  const loginBlockedUntil = useAuthStore((s) => s.loginBlockedUntil);
  const recordLoginAttempt = useAuthStore((s) => s.recordLoginAttempt);
  const resetLoginAttempts = useAuthStore((s) => s.resetLoginAttempts);
  const router = useRouter();

  useOAuthCallback();

  const isBlocked = loginBlockedUntil > Date.now();

  useEffect(() => {
    if (!isBlocked) {
      setCountdown(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.ceil((loginBlockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setCountdown(0);
        clearInterval(interval);
      } else {
        setCountdown(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isBlocked, loginBlockedUntil]);

  const onSubmit = handleSubmit(async ({ email, password }) => {
    if (isBlocked) return;

    dispatch({ type: 'SUBMIT_START' });
    const { data, error } = await authService.signIn(email, password);
    dispatch({ type: 'SUBMIT_END' });

    if (error) {
      recordLoginAttempt();
      if (isEmailNotConfirmed(error)) {
        router.push({ pathname: '/(auth)/confirm', params: { email } });
        return;
      }
      dispatch({ type: 'SET_ERROR', message: getAuthErrorMessage(error) ?? error.message });
      return;
    }

    resetLoginAttempts();
    setSession(data.session);
  });

  const handleGoogleSignIn = async () => {
    dispatch({ type: 'SOCIAL_START', provider: 'google' });
    try {
      await authService.signInWithGoogle();
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', message: getAuthErrorMessage(err) ?? err.message ?? 'Google sign-in failed' });
    } finally {
      dispatch({ type: 'SOCIAL_END' });
    }
  };

  const handleAppleSignIn = async () => {
    dispatch({ type: 'SOCIAL_START', provider: 'apple' });
    try {
      await authService.signInWithApple();
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', message: getAuthErrorMessage(err) ?? err.message ?? 'Apple sign-in failed' });
    } finally {
      dispatch({ type: 'SOCIAL_END' });
    }
  };

  const isFormDisabled = loading || isBlocked || socialLoading !== null;

  return (
    <AuthLayout>
      <AuthCard>
        <View className="gap-lg">
          <Text className="text-headline-lg-mobile text-on-surface text-center font-semibold">
            Welcome back
          </Text>

          <View className="gap-md">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value, onBlur } }) => (
                <FloatingLabelField
                  label="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value, onBlur } }) => (
                <FloatingLabelField
                  label="Password"
                  secureTextEntry={!passwordVisible}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  trailingElement={
                    <EyeToggle visible={passwordVisible} onToggle={() => setPasswordVisible((v) => !v)} />
                  }
                />
              )}
            />
          </View>

          {serverError ? (
            <Text className="text-body-md text-error">{serverError}</Text>
          ) : null}

          {isBlocked && countdown > 0 ? (
            <Text className="text-body-md text-on-surface-variant text-center">
              Too many attempts. Try again in {countdown}s
            </Text>
          ) : null}

          <Pressable onPress={() => router.push('/(auth)/forgot-password')} className="self-end">
            <Text className="text-label-md text-primary">Forgot Password?</Text>
          </Pressable>

          <Button
            label={isBlocked ? `Wait ${countdown}s` : loading ? 'Signing in…' : 'Sign In'}
            onPress={onSubmit}
            disabled={isFormDisabled}
            fullWidth
          />

          {loginAttempts > 0 && !isBlocked && loginAttempts < 5 ? (
            <Text className="text-body-md text-on-surface-variant text-center">
              {5 - loginAttempts} attempts remaining
            </Text>
          ) : null}

          <FormDivider />

          <View className="gap-sm">
            <Button
              label="Sign in with Google"
              onPress={handleGoogleSignIn}
              disabled={socialLoading !== null}
              fullWidth
              variant="secondary"
              icon={<View className="w-5 h-5 rounded-full bg-[#4285F4] items-center justify-center"><Text className="text-white text-xs font-bold leading-5">G</Text></View>}
            />
            {Platform.OS === 'ios' && (
              <Button
                label="Sign in with Apple"
                onPress={handleAppleSignIn}
                disabled={socialLoading !== null}
                fullWidth
                variant="dark"
                icon={<Text className="text-white text-label-md"></Text>}
              />
            )}
          </View>
        </View>
      </AuthCard>

      <View className="flex-row justify-center mt-xl">
        <Text className="text-body-md text-on-surface-variant">Don't have an account? </Text>
        <Pressable onPress={() => router.replace('/(auth)/signup')}>
          <Text className="text-label-md text-primary">Sign Up</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}
