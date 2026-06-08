import { Image } from 'expo-image';

interface AppLogoProps {
  size?: number;
}

export function AppLogo({ size = 48 }: AppLogoProps) {
  return (
    <Image
      source={require('../../../../assets/logo.png')}
      style={{ width: size, height: size }}
      contentFit="contain"
    />
  );
}
