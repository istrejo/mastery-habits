import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '../../src/features/auth/components/AppLogo';
import { AuthCard } from '../../src/features/auth/components/AuthCard';
import { PasswordField } from '../../src/shared/ui/PasswordField';
import { Button } from '../../src/shared/ui/Button';
import { supabase } from '../../src/core/api/supabase';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordScreen() {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();

  const { control, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = handleSubmit(async ({ password }) => {
    setLoading(true);
    setServerError('');

    // If coming from deep link with token in URL
    if (params.token) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: params.token,
        type: 'recovery',
      });

      if (error) {
        setServerError('This link has expired or is invalid. Please request a new one.');
        setLoading(false);
        return;
      }
    }

    // Update password
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    setSuccess(true);
  });

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="items-center py-sm">
          <AppLogo />
        </View>
        <View className="flex-1 justify-center px-margin-mobile">
          <AuthCard>
            <View className="items-center gap-lg">
              <View className="w-12 h-12 rounded-full bg-surface-container items-center justify-center">
                <Ionicons name="checkmark-circle" size={28} color="#004ac6" />
              </View>
              <View className="items-center gap-sm">
                <Text className="text-headline-md text-on-surface font-semibold text-center">
                  Password updated
                </Text>
                <Text className="text-body-md text-on-surface-variant text-center">
                  Your password has been successfully reset.
                </Text>
              </View>
              <Button
                label="Sign In"
                onPress={() => router.replace('/(auth)/login')}
                fullWidth
              />
            </View>
          </AuthCard>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="items-center py-sm">
        <AppLogo />
      </View>
      <View className="flex-1 justify-center px-margin-mobile">
        <AuthCard>
          <View className="items-center gap-lg">
            <View className="items-center gap-sm">
              <View className="w-12 h-12 rounded-full bg-surface-container items-center justify-center">
                <Ionicons name="lock-open-outline" size={22} color="#004ac6" />
              </View>
              <Text className="text-headline-md text-on-surface font-semibold text-center">
                Create New Password
              </Text>
              <Text className="text-body-md text-on-surface-variant text-center">
                Enter your new password below.
              </Text>
            </View>

            <View className="gap-md w-full">
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value, onBlur } }) => (
                  <PasswordField
                    label="New Password"
                    placeholder="••••••••"
                    helper="Min 8 chars, uppercase, number, and special character."
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value, onBlur } }) => (
                  <PasswordField
                    label="Confirm Password"
                    placeholder="••••••••"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.confirmPassword?.message}
                  />
                )}
              />

              {serverError ? (
                <Text className="text-body-md text-error">{serverError}</Text>
              ) : null}

              <Button
                label={loading ? 'Updating…' : 'Reset Password'}
                onPress={onSubmit}
                disabled={loading}
                fullWidth
              />
            </View>

            <Pressable
              onPress={() => router.replace('/(auth)/login')}
              className="flex-row items-center gap-xs"
            >
              <Ionicons name="arrow-back" size={14} color="#004ac6" />
              <Text className="text-label-md text-primary">Back to Login</Text>
            </Pressable>
          </View>
        </AuthCard>
      </View>
    </SafeAreaView>
  );
}
