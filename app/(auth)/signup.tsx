import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';

WebBrowser.maybeCompleteAuthSession();
import { View, Text, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupFormData } from '../../src/features/auth/schemas/auth.schema';
import { AuthLayout } from '../../src/features/auth/components/AuthLayout';
import { AuthCard } from '../../src/features/auth/components/AuthCard';
import { LabeledField } from '../../src/shared/ui/LabeledField';
import { PasswordField } from '../../src/shared/ui/PasswordField';
import { FormDivider } from '../../src/shared/ui/FormDivider';
import { Button } from '../../src/shared/ui';
import { authService } from '../../src/features/auth/services/authService';
import { getAuthErrorMessage } from '../../src/features/auth/services/authErrors';
import { useOAuthCallback } from '../../src/features/auth/hooks/useOAuthCallback';

export default function SignupScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [serverError, setServerError] = useState('');
  const router = useRouter();

  useOAuthCallback();

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setLoading(true);
    setServerError('');
    const { error } = await authService.signUp(email, password);
    setLoading(false);
    if (error) {
      setServerError(getAuthErrorMessage(error) ?? error.message);
      return;
    }
    router.replace('/(auth)/confirm');
  });

  const handleGoogleSignUp = async () => {
    setSocialLoading('google');
    setServerError('');
    try {
      await authService.signInWithGoogle();
    } catch (err: any) {
      setServerError(getAuthErrorMessage(err) ?? err.message ?? 'Google sign-up failed');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleAppleSignUp = async () => {
    setSocialLoading('apple');
    setServerError('');
    try {
      await authService.signInWithApple();
    } catch (err: any) {
      setServerError(getAuthErrorMessage(err) ?? err.message ?? 'Apple sign-up failed');
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <AuthLayout>
      <View className="items-center gap-xs">
        <Text className="text-headline-lg-mobile text-on-surface font-semibold">
          Create your account
        </Text>
        <Text className="text-body-md text-on-surface-variant text-center">
          Join us to achieve calm control over your tasks.
        </Text>
      </View>

      <AuthCard>
        <View className="gap-md">
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, value, onBlur } }) => (
              <LabeledField
                label="Full Name"
                placeholder="Jane Doe"
                autoCapitalize="words"
                autoCorrect={false}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.fullName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value, onBlur } }) => (
              <LabeledField
                label="Email"
                placeholder="jane@example.com"
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
              <PasswordField
                label="Password"
                placeholder="••••••••"
                helper="Min 8 chars, uppercase, number, and special character."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          {serverError ? (
            <Text className="text-body-md text-error">{serverError}</Text>
          ) : null}

          <Button
            label={loading ? 'Creating account…' : 'Create Account'}
            onPress={onSubmit}
            disabled={loading}
            fullWidth
          />

          <FormDivider />

          <View className="gap-sm">
            <Button
              label="Sign up with Google"
              onPress={handleGoogleSignUp}
              disabled={socialLoading !== null}
              fullWidth
              variant="secondary"
              icon={<View className="w-5 h-5 rounded-full bg-[#4285F4] items-center justify-center"><Text className="text-white text-xs font-bold leading-5">G</Text></View>}
            />
            {Platform.OS === 'ios' && (
              <Button
                label="Sign up with Apple"
                onPress={handleAppleSignUp}
                disabled={socialLoading !== null}
                fullWidth
                variant="dark"
                icon={<Text className="text-white text-label-md"></Text>}
              />
            )}
          </View>
        </View>
      </AuthCard>

      <View className="items-center gap-sm">
        <Text className="text-body-md text-on-surface-variant text-center">
          By creating an account, you agree to our{' '}
          <Text className="text-primary">Terms of Service</Text>
          {' '}and{' '}
          <Text className="text-primary">Privacy Policy</Text>.
        </Text>
        <View className="flex-row justify-center gap-xs">
          <Text className="text-body-md text-on-surface">Already have an account?</Text>
          <Pressable onPress={() => router.replace('/(auth)/login')}>
            <Text className="text-label-md text-primary">Log In</Text>
          </Pressable>
        </View>
      </View>
    </AuthLayout>
  );
}
