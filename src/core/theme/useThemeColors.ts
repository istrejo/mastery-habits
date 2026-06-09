import { useSettingsStore } from '../../features/settings/useSettingsStore';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from './tokens';

export function useThemeColors() {
  const { colorScheme: storeScheme } = useSettingsStore();
  const systemScheme = useColorScheme();
  const resolved = storeScheme === 'system' ? (systemScheme ?? 'light') : storeScheme;
  return resolved === 'dark' ? darkTheme : lightTheme;
}
