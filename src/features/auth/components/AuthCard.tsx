import { View } from 'react-native';

interface AuthCardProps {
  children: React.ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <View className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-lg"
      style={{ boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
    >
      {children}
    </View>
  );
}
