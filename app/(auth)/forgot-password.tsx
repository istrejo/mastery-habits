import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../../src/features/auth/schemas/auth.schema';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '../../src/features/auth/components/AppLogo';
import { AuthCard } from '../../src/features/auth/components/AuthCard';
import { LabeledField } from '../../src/shared/ui/LabeledField';
import { authService } from '../../src/features/auth/services/authService';
import { getAuthErrorMessage } from '../../src/features/auth/services/authErrors';

export default function ForgotPasswordScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');
  const router = useRouter();

  const onSubmit = handleSubmit(async ({ email }) => {
    setLoading(true);
    setServerError('');
    const { error } = await authService.sendPasswordReset(email);
    setLoading(false);
    if (error) {
      setServerError(getAuthErrorMessage(error) ?? error.message);
      return;
    }
    setSent(true);
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Fixed Header */}
      <View className="items-center py-sm">
        <AppLogo />
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-[400px] self-center gap-lg">
          <AuthCard>
            {sent ? (
              <View className="items-center gap-lg">
                <View className="w-12 h-12 rounded-full bg-surface-container items-center justify-center">
                  <Ionicons name="checkmark-circle" size={28} color="#004ac6" />
                </View>
                <View className="items-center gap-sm">
                  <Text className="text-headline-md text-on-surface font-semibold text-center">
                    Check your inbox
                  </Text>
                  <Text className="text-body-md text-on-surface-variant text-center">
                    We sent a password reset link to your email. The link expires in 1 hour.
                  </Text>
                </View>
                <Pressable
                  onPress={() => router.replace('/(auth)/login')}
                  className="flex-row items-center gap-xs"
                >
                  <Ionicons name="arrow-back" size={14} color="#004ac6" />
                  <Text className="text-label-md text-primary">Back to Login</Text>
                </Pressable>
              </View>
            ) : (
              <View className="gap-lg">
                <View className="items-center gap-sm">
                  <View className="w-12 h-12 rounded-full bg-surface-container items-center justify-center">
                    <Ionicons name="key-outline" size={22} color="#004ac6" />
                  </View>
                  <Text className="text-headline-md text-on-surface font-semibold text-center">
                    Reset Password
                  </Text>
                  <Text className="text-body-md text-on-surface-variant text-center">
                    Enter the email associated with your account and we'll send you a link to reset your password.
                  </Text>
                </View>

                <View className="gap-md">
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, value, onBlur } }) => (
                      <LabeledField
                        label="Email Address"
                        placeholder="you@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.email?.message}
                        leadingIcon={<Ionicons name="mail-outline" size={18} color="#737686" />}
                      />
                    )}
                  />

                  {serverError ? (
                    <Text className="text-body-md text-error">{serverError}</Text>
                  ) : null}

                  <Pressable
                    onPress={onSubmit}
                    disabled={loading}
                    className={`w-full flex-row items-center justify-center gap-xs py-3 px-4 rounded-lg bg-primary ${loading ? 'opacity-50' : ''}`}
                  >
                    <Text className="text-on-primary font-semibold text-label-md uppercase tracking-widest">
                      {loading ? 'Sending…' : 'Send Link'}
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                  </Pressable>
                </View>
              </View>
            )}

            {!sent ? (
              <Pressable
                onPress={() => router.replace('/(auth)/login')}
                className="flex-row items-center justify-center gap-xs mt-lg"
              >
                <Ionicons name="arrow-back" size={14} color="#004ac6" />
                <Text className="text-label-md text-primary">Back to Login</Text>
              </Pressable>
            ) : null}
          </AuthCard>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="items-center gap-xs py-lg px-margin-mobile">
        <View className="flex-row gap-md mb-xs">
          <Pressable>
            <Text className="text-label-md text-outline">Privacy Policy</Text>
          </Pressable>
          <Pressable>
            <Text className="text-label-md text-outline">Terms of Service</Text>
          </Pressable>
          <Pressable>
            <Text className="text-label-md text-outline">Help Center</Text>
          </Pressable>
        </View>
        <Text className="text-label-md text-on-surface-variant opacity-70">
          © 2024 Pendie Productivity. Secure & Encrypted.
        </Text>
      </View>
    </SafeAreaView>
  );
}
