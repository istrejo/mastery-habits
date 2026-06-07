import { View } from 'react-native';

interface AuthCardProps {
  children: React.ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <View className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-lg"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 4 }}
    >
      {children}
    </View>
  );
}
