import { Pressable, Text, View } from 'react-native';

interface GoogleSignInButtonProps {
  label?: string;
  onPress: () => void;
}

function GoogleIcon() {
  return (
    <View className="w-5 h-5 rounded-full bg-[#4285F4] items-center justify-center">
      <Text className="text-white text-xs font-bold leading-5">G</Text>
    </View>
  );
}

export function GoogleSignInButton({ label = 'Sign in with Google', onPress }: GoogleSignInButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="w-full flex-row justify-center items-center gap-sm py-3 px-4 border border-outline-variant rounded bg-surface-container-lowest active:bg-surface-container-low"
    >
      <GoogleIcon />
      <Text className="text-label-md text-on-surface uppercase tracking-widest">{label}</Text>
    </Pressable>
  );
}
