import { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { AuthLayout } from '../../src/features/auth/components/AuthLayout';
import { AuthCard } from '../../src/features/auth/components/AuthCard';
import { LabeledField } from '../../src/shared/ui/LabeledField';
import { PasswordField } from '../../src/shared/ui/PasswordField';
import { FormDivider } from '../../src/shared/ui/FormDivider';
import { GoogleSignInButton } from '../../src/features/auth/components/GoogleSignInButton';
import { Button } from '../../src/shared/ui';
import { authService } from '../../src/features/auth/services/authService';

type FormData = { fullName: string; email: string; password: string };

export default function SignupScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const router = useRouter();

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setLoading(true);
    setServerError('');
    const { error } = await authService.signUp(email, password);
    setLoading(false);
    if (error) {
      setServerError(error.message);
      return;
    }
    router.replace('/(auth)/confirm');
  });

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
            rules={{ required: 'Full name is required' }}
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
            rules={{
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
            }}
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
            rules={{
              required: 'Password is required',
              minLength: { value: 8, message: 'At least 8 characters' },
            }}
            render={({ field: { onChange, value, onBlur } }) => (
              <PasswordField
                label="Password"
                placeholder="••••••••"
                helper="Must be at least 8 characters long."
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

          <GoogleSignInButton
            label="Sign up with Google"
            onPress={() => Alert.alert('Coming soon', 'Google sign-up is not yet available.')}
          />
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
