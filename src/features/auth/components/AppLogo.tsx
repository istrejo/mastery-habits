import { Image } from 'react-native';

interface AppLogoProps {
  size?: number;
}

export function AppLogo({ size = 48 }: AppLogoProps) {
  return (
    <Image
      source={require('../../../../assets/logo.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
