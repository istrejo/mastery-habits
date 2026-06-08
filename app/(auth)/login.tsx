import { useState, useEffect } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../../src/features/auth/schemas/auth.schema';
import { AuthLayout } from '../../src/features/auth/components/AuthLayout';
import { AuthCard } from '../../src/features/auth/components/AuthCard';
import { FloatingLabelField } from '../../src/shared/ui/FloatingLabelField';
import { FormDivider } from '../../src/shared/ui/FormDivider';
import { GoogleSignInButton } from '../../src/features/auth/components/GoogleSignInButton';
import { EyeToggle } from '../../src/features/auth/components/EyeToggle';
import { Button } from '../../src/shared/ui';
import { authService } from '../../src/features/auth/services/authService';
import { getAuthErrorMessage, isEmailNotConfirmed } from '../../src/features/auth/services/authErrors';
import { useAuthStore } from '../../src/features/auth/useAuthStore';

export default function LoginScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const setSession = useAuthStore((s) => s.setSession);
  const loginAttempts = useAuthStore((s) => s.loginAttempts);
  const loginBlockedUntil = useAuthStore((s) => s.loginBlockedUntil);
  const recordLoginAttempt = useAuthStore((s) => s.recordLoginAttempt);
  const resetLoginAttempts = useAuthStore((s) => s.resetLoginAttempts);
  const router = useRouter();

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

    setLoading(true);
    setServerError('');
    const { data, error } = await authService.signIn(email, password);
    setLoading(false);

    if (error) {
      recordLoginAttempt();
      if (isEmailNotConfirmed(error)) {
        router.push({ pathname: '/(auth)/confirm', params: { email } });
        return;
      }
      setServerError(getAuthErrorMessage(error) ?? error.message);
      return;
    }

    resetLoginAttempts();
    setSession(data.session);
  });

  const isFormDisabled = loading || isBlocked;

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

          <GoogleSignInButton
            label="Sign in with Google"
            onPress={() => Alert.alert('Coming soon', 'Google sign-in is not yet available.')}
          />
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
