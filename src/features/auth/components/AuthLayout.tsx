import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from './AppLogo';

interface AuthLayoutProps {
  children: React.ReactNode;
  centered?: boolean;
}

export function AuthLayout({ children, centered = false }: AuthLayoutProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 16,
          paddingVertical: 32,
          ...(centered ? { justifyContent: 'center', alignItems: 'center' } : {}),
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className={`w-full max-w-[400px] gap-xl ${centered ? 'self-center items-center' : ''}`}>
          <View className="items-center">
            <AppLogo />
          </View>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
