import { useState } from 'react';
import { Text, View, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@core/theming';
import { Button, Card } from '@core/components';
import { useAuth } from '../hooks/useAuth';

interface CheckEmailViewProps {
  email: string;
  onDifferentEmail: () => void;
}

export const CheckEmailView: React.FC<CheckEmailViewProps> = ({ email, onDifferentEmail }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { resendVerification, loading, resendSent, error } = useAuth();
  const [resending, setResending] = useState(false);

  const onResend = async () => {
    setResending(true);
    try {
      await resendVerification(email);
    } finally {
      setResending(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: theme.spacing.stackLg,
      }}
    >
      <View style={{ width: '100%', maxWidth: 440, alignSelf: 'center' }}>
        <View style={{ marginBottom: theme.spacing.stackLg }}>
          <Text
            style={{
              color: theme.text.secondary,
              fontSize: theme.typography.scale.microBold.fontSize,
              fontFamily: 'Lexend_600SemiBold',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              marginBottom: theme.spacing.stackSm,
            }}
          >
            {t('login.app_title')}
          </Text>
          <Text
            style={{
              color: theme.text.primary,
              fontSize: theme.typography.scale.titleLg.fontSize,
              lineHeight: theme.typography.scale.titleLg.lineHeight,
              fontFamily: 'Anton_400Regular',
              letterSpacing: theme.typography.scale.titleLg.letterSpacing,
              textTransform: 'uppercase',
            }}
          >
            {t('signup.check_inbox_title')}
          </Text>
          <Text
            style={{
              color: theme.text.secondary,
              fontSize: theme.typography.scale.bodyMain.fontSize,
              lineHeight: theme.typography.scale.bodyMain.lineHeight,
              fontFamily: 'Lexend_400Regular',
              marginTop: theme.spacing.stackSm,
            }}
          >
            {t('signup.check_inbox_body', { email })}
          </Text>
        </View>

        <Card style={{ gap: theme.spacing.stackMd }}>
          <View
            style={{
              backgroundColor: theme.bg.surfaceAlt,
              borderRadius: theme.radius.sm,
              padding: theme.spacing.stackMd,
              borderWidth: theme.borderWidth.default,
              borderColor: theme.border.default,
              gap: theme.spacing.stackSm,
            }}
          >
            <Text
              style={{
                color: theme.text.secondary,
                fontSize: theme.typography.scale.microBold.fontSize,
                fontFamily: 'Lexend_500Medium',
              }}
            >
              {t('signup.check_inbox_spam_hint')}
            </Text>
            {resendSent ? (
              <Text
                style={{
                  color: theme.status.success,
                  fontSize: theme.typography.scale.microBold.fontSize,
                  fontFamily: 'Lexend_500Medium',
                }}
              >
                {t('login.resend_sent')}
              </Text>
            ) : null}
            {error && !resendSent ? (
              <Text
                style={{
                  color: theme.status.danger,
                  fontSize: theme.typography.scale.microBold.fontSize,
                  fontFamily: 'Lexend_500Medium',
                }}
              >
                {error}
              </Text>
            ) : null}
          </View>

          <Button
            label={t('signup.check_inbox_resend')}
            onPress={onResend}
            loading={resending || loading}
            variant="secondary"
          />
        </Card>

        <View
          style={{
            alignItems: 'center',
            gap: theme.spacing.stackMd,
            marginTop: theme.spacing.stackLg,
          }}
        >
          <Pressable onPress={onDifferentEmail}>
            <Text
              style={{
                color: theme.text.secondary,
                fontSize: theme.typography.scale.microBold.fontSize,
                fontFamily: 'Lexend_500Medium',
                textDecorationLine: 'underline',
              }}
            >
              {t('signup.check_inbox_different_email')}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};
