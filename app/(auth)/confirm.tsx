import { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthLayout } from '../../src/features/auth/components/AuthLayout';
import { AuthCard } from '../../src/features/auth/components/AuthCard';
import { OTPForm } from '../../src/features/auth/components/OTPForm';
import { Button } from '../../src/shared/ui';
import { authService } from '../../src/features/auth/services/authService';
import { getAuthErrorMessage } from '../../src/features/auth/services/authErrors';
import { useAuthStore } from '../../src/features/auth/useAuthStore';

const RESEND_COOLDOWN = 60;

export default function ConfirmScreen() {
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = user?.email ?? params.email ?? '';

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    if (!email || otpCode.length < 4) return;
    setLoading(true);
    setError('');
    const { data, error: verifyError } = await authService.verifyOtp(email, otpCode);
    setLoading(false);
    if (verifyError) {
      setError(getAuthErrorMessage(verifyError) ?? verifyError.message);
      return;
    }
    setSession(data.session);
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    const { error: resendError } = await authService.resendVerification(email);
    if (resendError) {
      setError(getAuthErrorMessage(resendError) ?? resendError.message);
      return;
    }
    setCooldown(RESEND_COOLDOWN);
  };

  return (
    <AuthLayout centered>
      <AuthCard>
        <View className="items-center gap-lg">
          <View className="w-28 h-28 rounded-full bg-surface-container-low items-center justify-center border border-outline-variant">
            <Ionicons name="mail-outline" size={48} color="#004ac6" />
          </View>

          <View className="items-center gap-sm">
            <Text className="text-headline-lg text-on-surface font-semibold">
              Check your email
            </Text>
            <Text className="text-body-md text-on-surface-variant text-center px-4">
              We've sent a 4-digit code to{' '}
              {email ? (
                <Text className="text-on-surface font-semibold">{email}</Text>
              ) : 'your inbox'}
              . Enter it below to verify your account.
            </Text>
          </View>

          <OTPForm onComplete={(code) => setOtpCode(code)} />

          {error ? (
            <Text className="text-body-md text-error text-center">{error}</Text>
          ) : null}

          <Button
            label={loading ? 'Verifying…' : 'Verify'}
            onPress={handleVerify}
            disabled={loading || otpCode.length < 4}
            fullWidth
          />

          <Pressable onPress={handleResend} disabled={cooldown > 0}>
            <Text className={`text-body-md ${cooldown > 0 ? 'text-on-surface-variant' : 'text-primary'}`}>
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Didn't receive a code? Resend"}
            </Text>
          </Pressable>
        </View>
      </AuthCard>
    </AuthLayout>
  );
}
