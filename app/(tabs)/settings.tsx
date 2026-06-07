import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/features/auth/useAuthStore';
import { authService } from '../../src/features/auth/services/authService';
import { useSettingsStore } from '../../src/features/settings/useSettingsStore';

export default function SettingsScreen() {
  const session = useAuthStore((s) => s.session);
  const reset = useAuthStore((s) => s.reset);
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const setColorScheme = useSettingsStore((s) => s.setColorScheme);

  const handleLogout = async () => {
    await authService.signOut();
    reset();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="px-margin-mobile py-lg">
        <Text className="text-headline-lg text-on-surface font-semibold mb-lg">
          Settings
        </Text>

        {/* Appearance Section */}
        <View className="gap-md mb-xl">
          <Text className="text-label-md text-on-surface-variant uppercase tracking-widest">
            Appearance
          </Text>
          <View className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => setColorScheme(mode)}
                className={`flex-row items-center justify-between px-md py-sm ${
                  mode !== 'system' ? 'border-b border-outline-variant' : ''
                }`}
              >
                <Text className="text-body-lg text-on-surface capitalize">
                  {mode}
                </Text>
                {colorScheme === mode && (
                  <Ionicons name="checkmark" size={20} color="#004ac6" />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Account Section */}
        {session && (
          <View className="gap-md">
            <Text className="text-label-md text-on-surface-variant uppercase tracking-widest">
              Account
            </Text>
            <Pressable
              onPress={handleLogout}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm flex-row items-center gap-sm"
            >
              <Ionicons name="log-out-outline" size={20} color="#ba1a1a" />
              <Text className="text-body-lg text-error">Log Out</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
