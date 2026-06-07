import { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { AuthLayout } from '../../src/features/auth/components/AuthLayout';
import { AuthCard } from '../../src/features/auth/components/AuthCard';
import { FloatingLabelField } from '../../src/shared/ui/FloatingLabelField';
import { FormDivider } from '../../src/shared/ui/FormDivider';
import { GoogleSignInButton } from '../../src/features/auth/components/GoogleSignInButton';
import { EyeToggle } from '../../src/features/auth/components/EyeToggle';
import { Button } from '../../src/shared/ui';
import { authService } from '../../src/features/auth/services/authService';
import { useAuthStore } from '../../src/features/auth/useAuthStore';

type FormData = { email: string; password: string };

export default function LoginScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setLoading(true);
    setServerError('');
    const { data, error } = await authService.signIn(email, password);
    setLoading(false);
    if (error) {
      setServerError(error.message);
      return;
    }
    setSession(data.session);
  });

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
              rules={{
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
              }}
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
              rules={{
                required: 'Password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
              }}
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

          <Pressable onPress={() => router.push('/(auth)/forgot-password')} className="self-end">
            <Text className="text-label-md text-primary">Forgot Password?</Text>
          </Pressable>

          <Button
            label={loading ? 'Signing in…' : 'Sign In'}
            onPress={onSubmit}
            disabled={loading}
            fullWidth
          />

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
