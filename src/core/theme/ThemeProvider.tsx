import { useColorScheme } from 'react-native';
import { vars } from 'nativewind';
import { View } from 'react-native';
import { useSettingsStore } from '../../features/settings/useSettingsStore';
import { lightTheme, darkTheme } from './tokens';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useSettingsStore();
  const systemScheme = useColorScheme();

  const resolved = colorScheme === 'system' ? (systemScheme ?? 'light') : colorScheme;
  const theme = resolved === 'dark' ? darkTheme : lightTheme;

  return (
    <View style={[{ flex: 1 }, vars(theme)]}>
      {children}
    </View>
  );
}
