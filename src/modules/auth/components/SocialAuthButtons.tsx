import { useEffect, useState } from 'react';
import { View, Text, Pressable, Platform, ActivityIndicator } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '@core/theming';

WebBrowser.warmUpAsync();

export function SocialAuthButtons() {
  const theme = useTheme();
  const { signInWithGoogle, signInWithApple, loading } = useAuth();
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
    }
    return () => { WebBrowser.coolDownAsync(); };
  }, []);

  return (
    <View style={{ width: '100%', gap: theme.spacing.stackMd }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.unit }}>
        <View style={{ flex: 1, height: 1, backgroundColor: theme.border.default }} />
        <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: 'Lexend_400Regular', textTransform: 'uppercase', letterSpacing: 1 }}>
          or
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: theme.border.default }} />
      </View>

      <Pressable
        onPress={signInWithGoogle}
        disabled={loading}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.unit,
          borderWidth: theme.borderWidth.default,
          borderColor: theme.border.default,
          borderRadius: theme.radius.md,
          paddingVertical: theme.spacing.stackMd,
          opacity: pressed || loading ? 0.6 : 1,
        })}
      >
        {loading ? (
          <ActivityIndicator size="small" color={theme.text.secondary} />
        ) : (
          <Text style={{ fontSize: 16 }}>G</Text>
        )}
        <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.bodyMain.fontSize, fontFamily: 'Lexend_500Medium' }}>
          Continue with Google
        </Text>
      </Pressable>

      {appleAvailable && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={theme.radius.md}
          style={{ width: '100%', height: 48 }}
          onPress={signInWithApple}
        />
      )}
    </View>
  );
}
